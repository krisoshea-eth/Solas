"use client";

import Link from "next/link";
import type { NextPage } from "next";
import { BugAntIcon, MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { Address } from "~~/components/scaffold-stark";
import { useAccount } from "@starknet-react/core";
import { Address as AddressType } from "@starknet-react/chains";
import Dashboard from "./dashboard/page";
const Home: NextPage = () => {
  const connectedAddress = useAccount();
  return (
    <>
      <Dashboard />
    </>
  );
};

export default Home;
