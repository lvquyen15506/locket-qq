import { useEffect, useState, useRef } from "react";
import { MdSlowMotionVideo } from "react-icons/md";
import { useApp } from "@/context/AppContext";
import { useMomentsStoreV2 } from "@/stores";
import { SonnerSuccess } from "@/components/ui/SonnerToast";

const MomentsGrid = ({
  visibleCount,
  increaseVisibleCount,
  moments,
  loadMoreOlder,
  hasMore,
  loading,
  hasFetched = false,
  onStartFetch,
  onClearCache,
}) => {
  const { post } = useApp();
  const {
    selectedMoment,
    setSelectedMoment,
    setSelectedMomentId,
    selectedFriendUid,
  } = post;

  const reloadMoments = useMomentsStoreV2((s) => s.reloadMoments);
  const [loadingMoments, setLoadingMoments] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  const [loadedItems, setLoadedItems] = useState([]);
  const lastElementRef = useRef(null);
  const observerRef = useRef(null);

  // Slice moments theo visibleCount
  const visibleMoments = moments.slice(0, visibleCount);

  const refreshMoments = async () => {
    setLoadingMoments(true);
    try {
      await reloadMoments();
      setLastFetchTime(new Date());
      SonnerSuccess("Làm mới thành công!");
    } catch (err) {
      console.warn("Failed", err);
    } finally {
      setLoadingMoments(false);
    }
  };

  // Set thời gian khi moments load lần đầu
  useEffect(() => {
    if (hasFetched && moments.length > 0 && !lastFetchTime) {
      setLastFetchTime(new Date());
    }
  }, [hasFetched, moments.length]);

  // Tự động tải dữ liệu khi component mount
  useEffect(() => {
    if (!hasFetched && onStartFetch && !loading) {
      onStartFetch();
    }
  }, [hasFetched, onStartFetch, loading]);

  // Intersection Observer
  useEffect(() => {
    if (!lastElementRef.current) return;

    observerRef.current?.disconnect();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry.isIntersecting) return;

        if (visibleCount < moments.length) {
          increaseVisibleCount();
          return;
        }

        if (loadMoreOlder && hasMore) {
          loadMoreOlder(selectedFriendUid);
        }
      },
      {
        rootMargin: "300px",
        threshold: 0.1,
      },
    );

    observerRef.current.observe(lastElementRef.current);

    return () => observerRef.current?.disconnect();
  }, [visibleCount, moments.length, hasMore, loadMoreOlder, selectedFriendUid]);

  const handleLoaded = (id) => {
    setLoadedItems((prev) => [...prev, id]);
  };

  const handleLoadMore = () => {
    if (visibleCount < moments.length) {
      increaseVisibleCount();
    } else if (hasMore) {
      loadMoreOlder(selectedFriendUid);
    }
  };

  if (moments.length === 0 && !loading) {
    return (
      <div className="grid grid-cols-3 md:grid-cols-6 md:gap-2 w-full h-full">
        <div className="aspect-square bg-base-300 rounded-2xl border-2 border-dashed border-base-content/30 flex flex-col justify-center items-center">
          <div className="text-2xl mb-1">+</div>
          <div className="text-xs font-medium text-base-content/70">
            Không có dữ liệu
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Nút hành động */}
      <div className="flex flex-wrap gap-2 w-full justify-center items-center mb-2">
        <button
          className="btn btn-sm rounded-full px-6 bg-base-100 hover:bg-base-200 border-base-300 font-normal shadow-sm"
          disabled={loadingMoments || loading}
          onClick={refreshMoments}
        >
          {(loadingMoments || loading) ? (
            <>
              Đang tải <span className="loading loading-dots loading-xs"></span>
            </>
          ) : (
            "Làm mới"
          )}
        </button>
      </div>

      {lastFetchTime && (
        <div className="text-xs text-base-content/50 text-center mb-2">
          ⏰ Lần tải gần nhất: {lastFetchTime.toLocaleString()}
        </div>
      )}

      <div className="grid gap-1 grid-cols-3 md:grid-cols-6 md:gap-2">
        {visibleMoments.map((item, index) => {
          const isLoaded = loadedItems.includes(item.id);
          const isLastItem = index === visibleMoments.length - 1;

          return (
            <div
              key={item.id}
              ref={isLastItem ? lastElementRef : null}
              onClick={() => {
                setSelectedMoment(index);
                setSelectedMomentId(item.id);
              }}
              className="aspect-square overflow-hidden cursor-pointer rounded-2xl relative group"
            >
              {!isLoaded && (
                <div className="absolute inset-0 skeleton w-full h-full rounded-2xl z-10" />
              )}

              <img
                src={item.thumbnail_url || item.image_url || item.thumbnailUrl}
                alt={item.caption || "Image"}
                className={`object-cover w-full h-full rounded-2xl transition-all duration-300 ${
                  isLoaded ? "opacity-100" : "opacity-0"
                }`}
                onLoad={() => handleLoaded(item.id)}
                loading="lazy"
              />

              {(item.video_url || item.videoUrl) && (
                <div className="absolute top-2 right-2 bg-primary/30 rounded-full z-20">
                  <MdSlowMotionVideo className="text-white" />
                </div>
              )}
            </div>
          );
        })}

        {loading &&
          Array.from({ length: 7 }).map((_, idx) => (
            <div
              key={`skeleton-${idx}`}
              className="aspect-square overflow-hidden bg-base-300 rounded-2xl relative group border-2 border-dashed border-gray-400 opacity-50"
            >
              <div className="absolute inset-0 skeleton w-full h-full rounded-2xl" />
            </div>
          ))}

        {!hasMore ? (
          <div className="aspect-square overflow-hidden cursor-pointer bg-base-300 rounded-2xl relative group flex items-center justify-center border-2 border-dashed border-base-content/30 hover:bg-base-200 transition-colors">
            <div className="text-center">
              <div className="text-2xl mb-1">-</div>
              <div className="text-xs text-base-content/70">
                Đã tải hết bài viết
              </div>
            </div>
          </div>
        ) : (
          <div
            onClick={handleLoadMore}
            className="aspect-square overflow-hidden cursor-pointer bg-base-300 rounded-2xl relative group flex items-center justify-center border-2 border-dashed border-base-content/30 hover:bg-base-200 transition-colors"
          >
            <div className="text-center">
              <div className="text-2xl mb-1">+</div>
              <div className="text-xs text-base-content/70">Xem thêm</div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default MomentsGrid;

