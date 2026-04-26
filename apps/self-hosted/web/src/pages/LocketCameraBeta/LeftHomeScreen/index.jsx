import React, { useEffect, useState } from "react";
import { useApp } from "@/context/AppContext";
import HeaderOne from "./Layout/HeaderOne";
import InfoUser from "./Layout/InfoUser";
import SegmentedToggle from "./Layout/SegmentedToggle";
import RollcallsPost from "./Views/RollcallsPage";
import StreakLocket from "./Views/CalenderStreak";
import { useAuthStore, useUploadQueueStore } from "@/stores";
import { getRollcallPosts } from "@/services";
import { replaceFirebaseWithCDN } from "@/utils/replace/replaceFirebaseWithCDN";
import { getImageSrc } from "@/utils/replace/replaceUrl";
import { getISOWeek } from "@/utils";

const LeftHomeScreen = ({ setIsProfileOpen }) => {
  const { user } = useAuthStore();
  const { navigation } = useApp();
  const { isProfileOpen } = navigation;
  const [posts, setPosts] = useState([]);

  const [active, setActive] = useState("lockets"); // 'rollcall' | 'lockets'

  // useEffect(() => {
  //   document.body.classList.toggle("overflow-hidden", isProfileOpen);
  //   return () => document.body.classList.remove("overflow-hidden");
  // }, [isProfileOpen]);
  const postedMoments = useUploadQueueStore((s) => s.postedMoments);

  const warmupImages = (urls = []) => {
    const unique = [...new Set(urls.filter(Boolean))];
    unique.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  };

  useEffect(() => {
    if (!user) return;

    const localMomentUrls = postedMoments
      .flatMap((m) => [m.thumbnail_url, m.image_url, m.thumbnailUrl, m.imageUrl])
      .map((u) => getImageSrc(u));

    warmupImages(localMomentUrls);

    const preloadRollcalls = async () => {
      try {
        const { week, year } = getISOWeek();
        const rollcalls = await getRollcallPosts({ selectWeek: week, selectYear: year });
        const rollcallUrls = (rollcalls || []).flatMap((post) =>
          (post.items || []).flatMap((item) => {
            const raw = getImageSrc(item.main_url);
            const cdn = getImageSrc(replaceFirebaseWithCDN(item.main_url));
            return [raw, cdn];
          }),
        );
        warmupImages(rollcallUrls);
      } catch (error) {
        console.warn("Failed to preload rollcall images", error);
      }
    };

    preloadRollcalls();
  }, [user, postedMoments]);

  // handle toggle bằng true/false
  const handleToggle = (tab) => {
    setActive(tab);
  };

  return (
    <div
      className={`fixed inset-0 w-full grid grid-rows-[auto_1fr] z-50 bg-base-100 text-base-content transition-transform duration-500 overflow-hidden ${isProfileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
    >
      {/* ==== Header (sticky) ==== */}
      <div className="relative shadow-md">
        <HeaderOne setIsProfileOpen={setIsProfileOpen} />
        <InfoUser user={user} />
      </div>

      {/* ==== Nội dung chính ==== */}
      <div className="flex bg-base-200 overflow-y-auto">
        {active === "rollcall" && (
          <RollcallsPost
            active={active}
            posts={posts}
            setPosts={setPosts}
            isProfileOpen={isProfileOpen}
          />
        )}
        {active === "lockets" && <StreakLocket recentPosts={postedMoments} />}
      </div>
      {/* ==== Bottom Segmented Toggle ==== */}
      <div className="fixed z-60 bottom-4 w-full select-none">
        <SegmentedToggle active={active} setActive={handleToggle} />
      </div>
    </div>
  );
};

export default LeftHomeScreen;
