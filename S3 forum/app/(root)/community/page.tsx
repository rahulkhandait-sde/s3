// app/community/page.tsx

import React from "react";
import CommunityCard from "@/components/cards/CommunityCard";
import DataRenderer from "@/components/DataRenderer";
import LocalSearch from "@/components/search/LocalSearch";
import ROUTES from "@/constants/routes";
import { EMPTY_COMMUNITIES } from "@/constants/states";
import { getCommunities } from "@/lib/actions/community.action";

const Community = async ({ searchParams }: RouteParams) => {
  const { page, pageSize, query, filter } = await searchParams;

  const { success, data, error } = await getCommunities({
    page: Number(page) || 1,
    pageSize: Number(pageSize) || 10,
    query,
    filter,
  });

  const { communities } = data || {};

  return (
    <>
      <h1 className="h1-bold text-dark100_light900 text-3xl">Community</h1>

      <section className="mt-11">
        <LocalSearch
          route={ROUTES.COMMUNITY}
          imgSrc="/icons/search.svg"
          placeholder="Search communities..."
          otherClasses="flex-1"
        />
      </section>

      <DataRenderer
        success={success}
        error={error}
        data={communities}
        empty={EMPTY_COMMUNITIES}
        render={(communities) => (
          <div className="mt-10 flex w-full flex-wrap gap-4">
            {communities.map((community) => (
              <CommunityCard key={community._id} {...community} />
            ))}
          </div>
        )}
      />
    </>
  );
};

export default Community;