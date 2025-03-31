import { useRoochClientQuery } from '@roochnetwork/rooch-sdk-kit';
import { formatEnvelopeData } from '@/utils/envelope';
import { useCallback, useMemo } from 'react';
import useSWR from 'swr';
import { ClaimDialogConfig, SocialLink } from '@/interfaces';

export const useEnvelopeDetail = (id: string) => {
  // 1. 从链上获取基本信封数据
  const chainDataQuery = useRoochClientQuery(
    'queryObjectStates',
    {
      filter: {
        object_id: id,
      },
      queryOption: {
        decode: true,
        showDisplay: true,
      },
    },
    {
      enabled: !!id,
      select: (data) => data.data[0],
    }
  );

  // 2. 从数据库获取扩展属性
  const attributesQuery = useSWR(id ? ['envelopeAttributes', id] : null, async () => {
    const response = await fetch(`/api/envelope-attributes?id=${id}`, {
      method: 'GET',
    });
    const attributes = await response.json();
    return {
      roochObjectId: attributes[0]?.roochObjectId,
      socialLinks: attributes[0]?.socialLinks as SocialLink[],
      claimDialogConfig: attributes[0]?.claimDialogConfig as ClaimDialogConfig,
    };
  });

  // 3. 合并数据并格式化
  const formattedData = useMemo(() => {
    // 如果任一查询仍在加载或出错，则返回null
    if (!chainDataQuery.data || !attributesQuery.data) {
      return null;
    }

    // 合并并格式化数据
    return formatEnvelopeData(chainDataQuery.data, attributesQuery.data);
  }, [chainDataQuery.data, attributesQuery.data]);

  // 返回合并的状态和数据
  return {
    data: formattedData,
    isPending: chainDataQuery.isPending || attributesQuery.isLoading,
    isError: chainDataQuery.isError || attributesQuery.error != null,
    error: chainDataQuery.error || attributesQuery.error,
    // 提供单独的查询状态，以便需要时使用
    chainDataQuery,
    attributesQuery,
    // 提供刷新两个数据源的函数
    refetch: useCallback(async () => {
      const results = await Promise.all([chainDataQuery.refetch()]);
      return results;
    }, [chainDataQuery, attributesQuery]),
  };
};
