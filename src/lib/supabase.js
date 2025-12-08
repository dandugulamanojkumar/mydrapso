import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const likeVideo = async (videoId, userId) => {
  const { data, error } = await supabase
    .from("likes")
    .insert([{ video_id: videoId, user_id: userId }])
    .select()
    .single();

  if (error && error.code !== '23505') {
    throw error;
  }

  if (data) {
    await supabase.rpc('increment_video_likes', { video_id: videoId });

    const { data: video } = await supabase
      .from("videos")
      .select("user_id")
      .eq("id", videoId)
      .single();

    if (video && video.user_id !== userId) {
      await supabase.from("notifications").insert([{
        user_id: video.user_id,
        actor_id: userId,
        type: "like",
        video_id: videoId
      }]);
    }
  }

  return data;
};

export const unlikeVideo = async (videoId, userId) => {
  const { error } = await supabase
    .from("likes")
    .delete()
    .eq("video_id", videoId)
    .eq("user_id", userId);

  if (error) throw error;

  await supabase.rpc('decrement_video_likes', { video_id: videoId });
};

export const checkIfLiked = async (videoId, userId) => {
  const { data, error } = await supabase
    .from("likes")
    .select("id")
    .eq("video_id", videoId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
};

export const getUserLikes = async (userId) => {
  const { data, error } = await supabase
    .from("likes")
    .select("video_id")
    .eq("user_id", userId);

  if (error) throw error;
  return data.map(like => like.video_id);
};

export const followUser = async (followerId, followingId) => {
  const { data, error } = await supabase
    .from("follows")
    .insert([{ follower_id: followerId, following_id: followingId }])
    .select()
    .single();

  if (error && error.code !== '23505') {
    throw error;
  }

  if (data) {
    await supabase.from("notifications").insert([{
      user_id: followingId,
      actor_id: followerId,
      type: "follow"
    }]);
  }

  return data;
};

export const unfollowUser = async (followerId, followingId) => {
  const { error } = await supabase
    .from("follows")
    .delete()
    .eq("follower_id", followerId)
    .eq("following_id", followingId);

  if (error) throw error;
};

export const checkIfFollowing = async (followerId, followingId) => {
  const { data, error } = await supabase
    .from("follows")
    .select("id")
    .eq("follower_id", followerId)
    .eq("following_id", followingId)
    .maybeSingle();

  if (error) throw error;
  return !!data;
};

export const getUserFollows = async (userId) => {
  const { data, error } = await supabase
    .from("follows")
    .select("following_id")
    .eq("follower_id", userId);

  if (error) throw error;
  return data.map(follow => follow.following_id);
};

export const addComment = async (videoId, userId, commentText) => {
  const { data, error } = await supabase
    .from("comments")
    .insert([{
      video_id: videoId,
      user_id: userId,
      comment_text: commentText
    }])
    .select(`
      *,
      users (
        id,
        username,
        avatar
      )
    `)
    .single();

  if (error) throw error;

  await supabase.rpc('increment_video_comments', { video_id: videoId });

  const { data: video } = await supabase
    .from("videos")
    .select("user_id")
    .eq("id", videoId)
    .single();

  if (video && video.user_id !== userId) {
    await supabase.from("notifications").insert([{
      user_id: video.user_id,
      actor_id: userId,
      type: "comment",
      video_id: videoId,
      comment_id: data.id
    }]);
  }

  return data;
};

export const getVideoComments = async (videoId) => {
  const { data, error } = await supabase
    .from("comments")
    .select(`
      *,
      users (
        id,
        username,
        avatar
      )
    `)
    .eq("video_id", videoId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const getNotifications = async (userId) => {
  const { data, error } = await supabase
    .from("notifications")
    .select(`
      *,
      actor:actor_id (
        id,
        username,
        avatar
      ),
      video:video_id (
        id,
        title,
        thumbnail_url
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
};

export const markNotificationAsRead = async (notificationId) => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) throw error;
};

export const markAllNotificationsAsRead = async (userId) => {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("user_id", userId)
    .eq("is_read", false);

  if (error) throw error;
};

export const getVideosWithUserData = async () => {
  const { data, error } = await supabase
    .from("videos")
    .select(`
      *,
      users (
        id,
        username,
        avatar,
        follower_count
      )
    `)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const getUserVideos = async (userId) => {
  const { data, error } = await supabase
    .from("videos")
    .select(`
      *,
      users (
        id,
        username,
        avatar,
        follower_count
      )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
};

export const getUserProfile = async (userId) => {
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) throw error;
  return data;
};

export const updateUserProfile = async (userId, updates) => {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const uploadProfilePicture = async (userId, file) => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `avatars/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('profile-pictures')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    if (uploadError.message.includes('Bucket not found')) {
      throw new Error('Storage bucket not configured. Please create a "profile-pictures" bucket in Supabase Storage.');
    }
    throw uploadError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('profile-pictures')
    .getPublicUrl(filePath);

  await updateUserProfile(userId, { avatar: publicUrl });

  return publicUrl;
};

export const uploadVideo = async (userId, videoFile, metadata) => {
  const fileExt = videoFile.name.split('.').pop();
  const fileName = `${userId}-${Date.now()}.${fileExt}`;
  const filePath = `videos/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('videos')
    .upload(filePath, videoFile, {
      cacheControl: '3600',
      upsert: false
    });

  if (uploadError) {
    if (uploadError.message.includes('Bucket not found')) {
      throw new Error('Storage bucket not configured. Please create a "videos" bucket in Supabase Storage.');
    }
    throw uploadError;
  }

  const { data: { publicUrl } } = supabase.storage
    .from('videos')
    .getPublicUrl(filePath);

  const videoData = {
    user_id: userId,
    title: metadata.title,
    description: metadata.description || '',
    video_url: publicUrl,
    duration: metadata.duration || 0,
    has_affiliate: metadata.hasAffiliate || false,
    affiliate_link: metadata.affiliateLink || null,
    has_location: metadata.hasLocation || false,
    location: metadata.location || null
  };

  const { data: video, error: insertError } = await supabase
    .from('videos')
    .insert([videoData])
    .select(`
      *,
      user:user_id (
        id,
        username,
        avatar,
        full_name
      )
    `)
    .single();

  if (insertError) throw insertError;

  if (metadata.products && metadata.products.length > 0) {
    const products = metadata.products.map(product => ({
      video_id: video.id,
      name: product.name,
      description: product.description || '',
      price: product.price || '',
      product_url: product.url,
      image_url: product.imageUrl || ''
    }));

    await supabase.from('products').insert(products);
  }

  return video;
};

export const getVideoProducts = async (videoId) => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('video_id', videoId);

  if (error) throw error;
  return data || [];
};

export const incrementVideoViews = async (videoId) => {
  await supabase.rpc('increment_video_views', { video_id: videoId });
};

export const subscribeToVideos = (callback) => {
  const channel = supabase
    .channel('videos-channel')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'videos'
      },
      (payload) => {
        callback(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
