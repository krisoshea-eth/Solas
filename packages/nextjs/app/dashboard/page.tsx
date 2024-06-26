"use client";
import Link from "next/link";
import React, { useState, useEffect } from "react";
import type { NextPage } from "next";
import { Bars3Icon, BugAntIcon,CheckBadgeIcon,DocumentTextIcon,CodeBracketIcon } from "@heroicons/react/24/outline";

const Dashboard = () => {
  return (
    <div>
      <div className="flex-grow w-full mt-16 px-8 py-12 mt-36">
          <div className="flex justify-center items-center gap-12 flex-col sm:flex-row ">
            <div className="flex flex-col bg-[#475299] px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <CheckBadgeIcon className="h-8 w-8 fill-secondary" />
              <p>
                Tinker with your smart contract using the{" "}
                <Link href="/dashboard/attestations" passHref className="link">
                  Make Attestations
                </Link>{" "}
                tab.
              </p>
            </div>
            <div className="flex flex-col bg-[#475299] px-10 py-10 text-center items-center max-w-xs rounded-3xl">
              <DocumentTextIcon className="h-8 w-8 fill-secondary" />
              <p>
                Explore attestation and schemas via the{" "}
                <Link href="/dashboard/schemas" passHref className="link">
                  Create Schemas
                </Link>{" "}
                tab.
              </p>
            </div>
          </div>
        </div>
    </div>
  );
};

export default Dashboard;
