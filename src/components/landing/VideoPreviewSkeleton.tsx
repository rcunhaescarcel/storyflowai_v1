import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Skeleton } from "@/components/ui/skeleton";

export const VideoPreviewSkeleton = () => {
  return (
    <AspectRatio ratio={16 / 9}>
      <Skeleton className="w-full h-full" />
    </AspectRatio>
  );
};