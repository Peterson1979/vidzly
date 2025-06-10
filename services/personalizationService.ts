
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { YouTubeVideo, FavoriteItem } from '../types';
import { 
    GEMINI_MODEL_TEXT, 
    MOCK_API_DELAY
} from '../constants'; 
// Removed: import { allMockVideos as globalAllMockVideos } from './youtubeService';
// globalAllMockVideos will be passed as parameter

// The API key is assumed to be pre-configured, valid, and accessible via process.env.API_KEY.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });


interface PersonalizedFeedResponse {
    recommendedVideoIds: string[];
}

const generateMockRecommendations = (favoriteItems: FavoriteItem[], allVideos: YouTubeVideo[], count: number = 5): YouTubeVideo[] => {
    console.warn("Personalization Service: Generating mock recommendations.");
    const favoriteVideoIds = new Set(favoriteItems.map(fav => fav.videoId));
    const nonFavoritedVideos = allVideos.filter(video => !favoriteVideoIds.has(video.id));
    
    let recommendations: YouTubeVideo[] = [];
    if (nonFavoritedVideos.length > 0) {
        const shuffledNonFavorites = [...nonFavoritedVideos].sort(() => 0.5 - Math.random());
        recommendations = shuffledNonFavorites.slice(0, count);
    }
    
    // If not enough non-favorites, fill with any other videos (excluding favorites and already recommended)
    if (recommendations.length < count) {
        const remainingCount = count - recommendations.length;
        const recommendationIds = new Set(recommendations.map(r => r.id));
        // Ensure we don't re-recommend from favorites if possible, and don't re-recommend already selected ones
        const availableForAll = allVideos.filter(video => !recommendationIds.has(video.id) && !favoriteVideoIds.has(video.id));
        const shuffledAll = [...availableForAll].sort(() => 0.5 - Math.random());
        recommendations.push(...shuffledAll.slice(0, remainingCount));
    }
    
    // Fallback: If still not enough, and favorites exist, add some favorite-related videos (as a last resort, though ideally we recommend new content)
    // This part might be tricky as the goal is usually to recommend *new* content.
    // For a true mock, just ensuring `count` videos are returned is key.
    if (recommendations.length < count && allVideos.length > 0) {
        const currentRecIds = new Set(recommendations.map(r => r.id));
        const fallbackCandidates = allVideos.filter(v => !currentRecIds.has(v.id));
        const shuffledFallback = [...fallbackCandidates].sort(() => 0.5 - Math.random());
        recommendations.push(...shuffledFallback.slice(0, count - recommendations.length));
    }


    return recommendations.slice(0, count);
};

export const getPersonalizedFeed = async (favoriteItems: FavoriteItem[], allVideos: YouTubeVideo[]): Promise<YouTubeVideo[]> => {
    if (favoriteItems.length === 0) { // 'if (!ai)' check removed
        console.warn("Personalization Service: No favorites provided. Using mock recommendations.");
        await new Promise(resolve => setTimeout(resolve, MOCK_API_DELAY / 2)); 
        return generateMockRecommendations(favoriteItems, allVideos);
    }

    try {
        const userProfileParts: string[] = [];
        const favoriteChannels = new Set<string>();
        const favoriteKeywords = new Set<string>();

        favoriteItems.forEach(fav => {
            const videoDetail = allVideos.find(v => v.id === fav.videoId);
            if (videoDetail) {
                favoriteChannels.add(videoDetail.channelTitle);
                // Extract keywords from title and description more carefully
                const titleWords = videoDetail.title.toLowerCase().match(/\b(\w{4,})\b/g) || [];
                const descWords = videoDetail.description.substring(0,100).toLowerCase().match(/\b(\w{4,})\b/g) || [];
                [...titleWords, ...descWords].forEach(word => favoriteKeywords.add(word));
            }
        });
        
        if (favoriteChannels.size > 0) {
            userProfileParts.push(`User enjoys channels like: ${Array.from(favoriteChannels).slice(0,3).join(', ')}.`);
        }
        if (favoriteKeywords.size > 0) {
            const commonKeywords = Array.from(favoriteKeywords).slice(0,7); // Take more keywords
            if(commonKeywords.length > 0) userProfileParts.push(`User shows interest in topics related to: ${commonKeywords.join(', ')}.`);
        }
        
        if (userProfileParts.length === 0) { 
             console.warn("Personalization Service: Could not build a significant user profile from favorites. Using mock recommendations.");
             return generateMockRecommendations(favoriteItems, allVideos);
        }

        const userProfilePrompt = userProfileParts.join(' ');
        const videoIdsToExclude = favoriteItems.map(fav => fav.videoId);
        // Prepare candidate videos: filter out already favorited, take a larger sample
        const candidateVideosForPrompt = allVideos
            .filter(v => !videoIdsToExclude.includes(v.id))
            .sort(() => 0.5 - Math.random()) // Shuffle before slicing
            .slice(0, 60) // Take a larger, random sample of non-favorited videos
            .map(v => ({ id: v.id, title: v.title, description: v.description.substring(0, 150) + "..." })); 

        if (candidateVideosForPrompt.length < 5) { 
            console.warn("Personalization Service: Not enough distinct candidate videos for recommendation. Using mock recommendations.");
            return generateMockRecommendations(favoriteItems, allVideos);
        }

        const prompt = `
            Based on the following user profile: "${userProfilePrompt}"
            Recommend 5 unique video IDs from the candidate video list below that the user might like.
            Do NOT recommend any video IDs that are already in the user's favorites (they have been excluded from the candidate list).
            
            Candidate Video List (ID, Title, Description Snippet):
            ${JSON.stringify(candidateVideosForPrompt)}

            Provide your response strictly as a JSON object with a single key "recommendedVideoIds", which is an array of 5 video string IDs.
            Example: {"recommendedVideoIds": ["videoId1", "videoId2", "videoId3", "videoId4", "videoId5"]}
            Ensure the JSON is valid and video IDs are from the provided candidate list.
        `;

        const response: GenerateContentResponse = await ai.models.generateContent({
            model: GEMINI_MODEL_TEXT,
            contents: prompt,
            config: {
                responseMimeType: "application/json",
                temperature: 0.8, // Slightly higher temperature for more variety
            }
        });
        
        let jsonStr = response.text.trim();
        const fenceRegex = /^```(\w*)?\s*\n?(.*?)\n?\s*```$/s;
        const match = jsonStr.match(fenceRegex);
        if (match && match[2]) {
          jsonStr = match[2].trim();
        }

        const parsedData = JSON.parse(jsonStr) as PersonalizedFeedResponse;

        if (!parsedData.recommendedVideoIds || !Array.isArray(parsedData.recommendedVideoIds) || parsedData.recommendedVideoIds.length === 0) {
            console.error("Personalization Service: Gemini returned invalid JSON structure for recommendations or no IDs. Falling back to mock.", parsedData);
            return generateMockRecommendations(favoriteItems, allVideos);
        }

        // Validate that recommended IDs are from the candidate list and not already favorited
        const validRecommendedIds = parsedData.recommendedVideoIds.filter(id => 
            candidateVideosForPrompt.some(candidate => candidate.id === id) &&
            !videoIdsToExclude.includes(id)
        );
        
        if (validRecommendedIds.length !== parsedData.recommendedVideoIds.length) {
            console.warn("Personalization Service: Gemini recommended some invalid or already favorited video IDs. Filtering them out.");
        }
        
        if (validRecommendedIds.length === 0) {
             console.error("Personalization Service: Gemini selected no valid, non-favorited video IDs. Falling back to mock.");
            return generateMockRecommendations(favoriteItems, allVideos);
        }


        let recommendedVideosDetails = validRecommendedIds
            .map(id => allVideos.find(video => video.id === id))
            .filter(video => video !== undefined).slice(0, 5) as YouTubeVideo[]; // Ensure max 5
        
        // If Gemini returns fewer than 5 valid videos, fill with mock recommendations
        if(recommendedVideosDetails.length < 5) {
            console.warn(`Personalization Service: Gemini returned only ${recommendedVideosDetails.length} valid recommendations. Filling with mock data.`);
            const mockFillCount = 5 - recommendedVideosDetails.length;
            const existingRecIds = new Set(recommendedVideosDetails.map(v => v.id));
            const additionalMockVideos = generateMockRecommendations(favoriteItems, allVideos, mockFillCount + existingRecIds.size) // Request more to filter
                .filter(mv => !existingRecIds.has(mv.id)) // Filter out duplicates
                .slice(0, mockFillCount);
            recommendedVideosDetails.push(...additionalMockVideos);
        }

        return recommendedVideosDetails.length > 0 ? recommendedVideosDetails : generateMockRecommendations(favoriteItems, allVideos);

    } catch (error) {
        console.error("Personalization Service: Error getting personalized feed from Gemini or parsing JSON:", error);
        return generateMockRecommendations(favoriteItems, allVideos);
    }
};
