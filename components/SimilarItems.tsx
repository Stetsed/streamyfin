import { apiAtom, userAtom } from "@/providers/JellyfinProvider";
import { BaseItemDto } from "@jellyfin/sdk/lib/generated-client/models";
import { getLibraryApi } from "@jellyfin/sdk/lib/utils/api";
import { useQuery } from "@tanstack/react-query";
import { router } from "expo-router";
import { useAtom } from "jotai";
import {
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  View,
} from "react-native";
import ContinueWatchingPoster from "./ContinueWatchingPoster";
import { ItemCardText } from "./ItemCardText";
import { Text } from "./common/Text";

type SimilarItemsProps = {
  itemId: string;
};

export const SimilarItems: React.FC<SimilarItemsProps> = ({ itemId }) => {
  const [api] = useAtom(apiAtom);
  const [user] = useAtom(userAtom);

  const { data: similarItems, isLoading } = useQuery<BaseItemDto[]>({
    queryKey: ["similarItems", itemId],
    queryFn: async () => {
      if (!api || !user?.Id) return [];
      const response = await getLibraryApi(api).getSimilarItems({
        itemId,
        userId: user.Id,
        limit: 5,
      });

      return response.data.Items || [];
    },
    enabled: !!api && !!user?.Id,
    staleTime: Infinity,
  });

  return (
    <View>
      <Text className="px-4 text-2xl font-bold mb-2">Similar items</Text>
      {isLoading ? (
        <View className="my-12">
          <ActivityIndicator />
        </View>
      ) : (
        <ScrollView horizontal>
          <View className="px-4 flex flex-row gap-x-2">
            {similarItems?.map((item) => (
              <TouchableOpacity
                key={item.Id}
                onPress={() => router.push(`/items/${item.Id}/page`)}
                className="flex flex-col w-48"
              >
                <ContinueWatchingPoster item={item} />
                <ItemCardText item={item} />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}
      {similarItems?.length === 0 && <Text>No similar items</Text>}
    </View>
  );
};
