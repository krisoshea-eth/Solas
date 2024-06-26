import React from "react";
import Link from "next/link";

import {
  CurrencyDollarIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon } from "@heroicons/react/24/outline";
import { SwitchTheme } from "~~/components/SwitchTheme";
import { BuidlGuidlLogo } from "~~/components/assets/BuidlGuidlLogo";
import { useTargetNetwork } from "~~/hooks/scaffold-stark/useTargetNetwork";
import { useGlobalState } from "~~/services/store/store";
import { devnet } from "@starknet-react/chains";
import { Faucet } from "~~/components/scaffold-stark/Faucet";
import { getBlockExplorerLink } from "~~/utils/scaffold-stark";

/**
 * Site footer
 */
export const Footer = () => {
  const nativeCurrencyPrice = useGlobalState(
    (state) => state.nativeCurrencyPrice,
  );
  const { targetNetwork } = useTargetNetwork();
  const isLocalNetwork = targetNetwork.id === devnet.id;

  return (
    <div className="min-h-0 py-5 px-1 mb-11 lg:mb-0 bg-[#475299]">
      <div>
        <SwitchTheme
          className={`pointer-events-auto ${
            isLocalNetwork ? "self-end md:self-auto" : ""
          }`}
        />
      </div>
      <div className="w-full">
        <ul className="menu menu-horizontal w-full">
          <div className="flex justify-center items-center gap-2 text-sm w-full">

          </div>
        </ul>
      </div>
    </div>
  );
};
