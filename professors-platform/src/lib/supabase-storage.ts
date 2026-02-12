import { supabase } from './supabase'

/**
 * Upload profile image to Supabase Storage
 * @param userId - User ID (will create folder with this name)
 * @param file - Image file to upload
 * @returns Public URL of the uploaded image or null if error
 */
export async function uploadProfileImage(
    userId: string,
    file: File
): Promise<string | null> {
    try {
        // Get file extension
        const fileExt = file.name.split('.').pop()?.toLowerCase()
        if (!fileExt) {
            throw new Error('Archivo sin extensión')
        }

        // Create unique filename with timestamp
        const timestamp = Date.now()
        const fileName = `${userId}/avatar-${timestamp}.${fileExt}`

        // Upload file to Supabase Storage
        const { data, error } = await supabase.storage
            .from('profile-images')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: true, // Replace if exists
            })

        if (error) {
            console.error('Error uploading image:', error)
            throw error
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('profile-images')
            .getPublicUrl(fileName)

        return publicUrl
    } catch (error) {
        console.error('Error in uploadProfileImage:', error)
        return null
    }
}

/**
 * Delete profile image from Supabase Storage
 * @param imageUrl - Full public URL of the image to delete
 * @returns true if successful, false otherwise
 */
export async function deleteProfileImage(imageUrl: string): Promise<boolean> {
    try {
        // Extract file path from public URL
        const urlParts = imageUrl.split('/profile-images/')
        if (urlParts.length !== 2) {
            throw new Error('URL inválida')
        }

        const filePath = urlParts[1]

        const { error } = await supabase.storage
            .from('profile-images')
            .remove([filePath])

        if (error) {
            console.error('Error deleting image:', error)
            return false
        }

        return true
    } catch (error) {
        console.error('Error in deleteProfileImage:', error)
        return false
    }
}

/**
 * Get temporary URL for private images (not used for profile images, but useful)
 * @param filePath - Path to file in storage
 * @param expiresIn - Expiration time in seconds (default 60)
 * @returns Signed URL
 */
export async function getSignedUrl(
    filePath: string,
    expiresIn: number = 60
): Promise<string | null> {
    try {
        const { data, error } = await supabase.storage
            .from('profile-images')
            .createSignedUrl(filePath, expiresIn)

        if (error) {
            console.error('Error getting signed URL:', error)
            return null
        }

        return data.signedUrl
    } catch (error) {
        console.error('Error in getSignedUrl:', error)
        return null
    }
}
