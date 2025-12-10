import { useSelector, useDispatch } from "react-redux";
import { useCallback, useMemo, useEffect, useRef } from "react";
import {
  clearUser,
  selectUser,
  selectUserProfile,
  selectUserName,
  selectUserEmail,
  selectUserImage,
  selectUserId,
  setUser,
} from "../../src/features/userSlice/userSlice";
import { useGetUserProfileQuery } from "../redux/userprofileApi/userprofileApi";

const useUser = () => {
  const dispatch = useDispatch();

  // Get user data from Redux store
  const user = useSelector(selectUser);
  const userProfile = useSelector(selectUser);
  const userName = useSelector(selectUserName);
  const userEmail = useSelector(selectUserEmail);
  const userImage = useSelector(selectUserImage);
  const userIdFromRedux = useSelector(selectUserId);

  // Get user profile from API
  // refetchOnMountOrArgChange ensures data is fresh when component mounts or args change
  const {
    data: profileData,
    isLoading,
    error,
    refetch,
  } = useGetUserProfileQuery(undefined, {
    refetchOnMountOrArgChange: true,
  });

  // Track last synced data hash to detect changes
  const lastSyncedHashRef = useRef(null);

  // Get userId from Redux or fallback to profileData
  const userId = useMemo(() => {
    return userIdFromRedux || profileData?.data?._id || null;
  }, [userIdFromRedux, profileData?.data?._id]);

  // Create a stable hash of profileData for comparison
  const profileDataHash = useMemo(() => {
    if (!profileData?.data) return null;
    try {
      return JSON.stringify(profileData.data);
    } catch {
      return null;
    }
  }, [profileData?.data]);

  // Automatically sync profileData to Redux when available
  // This ensures userId and all user data is available in Redux for other components
  useEffect(() => {
    if (profileData?.data && profileData.success && profileData.data._id) {
      const newUserData = profileData.data;

      // Always update if hash is different or if we haven't synced yet
      if (
        lastSyncedHashRef.current !== profileDataHash &&
        profileDataHash !== null
      ) {
        dispatch(setUser(newUserData));
        lastSyncedHashRef.current = profileDataHash;
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileDataHash, profileData?.success, dispatch]);

  const updateUserProfile = useCallback(
    (userData) => {
      // Only update if data is actually different
      try {
        if (JSON.stringify(userData) !== JSON.stringify(user)) {
          dispatch(setUser(userData));
        }
      } catch {
        // Fallback if stringify fails
        dispatch(setUser(userData));
      }
    },
    [dispatch, user]
  );

  const clearUserProfile = useCallback(() => {
    dispatch(clearUser());
  }, [dispatch]);

  return {
    // State
    user,
    userProfile,
    userName,
    userEmail,
    userImage,
    userId,
    // API Data
    profileData,
    isLoading,
    error,
    refetch,

    // Actions
    updateUserProfile,
    clearUserProfile,
  };
};

export default useUser;
