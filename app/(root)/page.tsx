import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";
import Image from "next/image";
import InterviewCard from "@/components/InterviewCard";
import {
  getCurrentUser,
  getInterviewByUserId,
  getLatestInterviews,
} from "@/lib/actions/auth.action";

const Page = async () => {
  const user = await getCurrentUser();
  const [userInterviews,latestInterviews] = await Promise.all([
    user?.id ? await getInterviewByUserId(user.id) : null,
    user?.id ? await getLatestInterviews({ userId: user.id }) : null
  ])
  const hasPastInterviews = userInterviews?.length ? userInterviews.length > 0 : false;
  const hasUpcomingInterviews = latestInterviews?.length ? latestInterviews.length > 0 : false;
  console.log(userInterviews);
  console.log(user?.id);
  return (
    <>
      <section className="card-cta">
        <div className="flex flex-col gap-6 max-w-lg">
          <h2>Get Interview Ready with AI Powered Practice & Feedback</h2>
          <p className="text-lg">
            Practice on real interview questions and get good instant feedback
          </p>
          <Button asChild className="btn-primary max-sm:w-full">
            <Link href="/interview">Start an Interview</Link>
          </Button>
        </div>
        <Image
          src="/robot.png"
          alt="robot"
          width={400}
          height={400}
          className="max-sm:hidden"
        />
      </section>
      <section className="flex flex-col gap-6 mt-8">
        <h2>Your Interviews</h2>
        <div className="interviews-section">
          {hasPastInterviews ? (
            userInterviews?.map((interview) => (
              <InterviewCard {...interview} key={interview.id} />
            ))
          ) : (
            <p>You havent taken any interviews yet 🧐</p>
          )}
        </div>
      </section>
      <section className="flex flex-col gap-6 mt-8">
        <h2>Take an interview</h2>
        <div className="interviews-section">
        {hasUpcomingInterviews ? (
            
            latestInterviews?.map((interview) => (
              <InterviewCard {...interview} key={interview.id} />
            ))
          ) : (
            <p>There are no new interviews available😭</p>
          )}
        </div>
      </section>
    </>
  );
};

export default Page;
