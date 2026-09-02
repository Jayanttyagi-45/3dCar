"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Car360Viewer from "@/components/Car360Viewer";

const PanoramicView = dynamic(() => import("@/components/PanoramicView"), {
  ssr: false,
  loading: () => (
    <div className="flex aspect-[4/3] w-full max-w-5xl mx-auto items-center justify-center rounded-lg bg-neutral-100">
      <span className="text-sm text-neutral-500">Loading panorama&hellip;</span>
    </div>
  ),
});

const CAR_360_FOLDER = "https://naver.github.io/egjs-axes/img/demos/car360/";
const CAR_360_FILENAME_PATTERN = "beatle ({index}).png";
const CAR_360_FRAME_COUNT = 36;

const INTERIOR_PANORAMA_URL = "/interior-panorama-demo.webp";

type ViewTab = "exterior" | "interior";

const TABS: { id: ViewTab; label: string }[] = [
  { id: "exterior", label: "Exterior" },
  { id: "interior", label: "Interior" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<ViewTab>("exterior");
  const [hasOpenedInterior, setHasOpenedInterior] = useState(false);

  const handleTabClick = (tab: ViewTab) => {
    setActiveTab(tab);
    if (tab === "interior") setHasOpenedInterior(true);
  };

  return (
    <div className="flex min-h-screen flex-col items-center bg-zinc-50 px-6 py-16 font-sans">
      <div className="w-full max-w-5xl">
        <h1 className="text-center text-2xl font-semibold tracking-tight text-zinc-900">
          360&deg; Car Viewer
        </h1>

        <div className="mt-10">
          <div className={activeTab === "exterior" ? "" : "hidden"}>
            <Car360Viewer
              folder={CAR_360_FOLDER}
              filenamePattern={CAR_360_FILENAME_PATTERN}
              frameCount={CAR_360_FRAME_COUNT}
              alt="360 degree rotating view of a car"
              isActive={activeTab === "exterior"}
            />
          </div>

          {hasOpenedInterior && (
            <div className={activeTab === "interior" ? "" : "hidden"}>
              <PanoramicView
                imageUrl={INTERIOR_PANORAMA_URL}
                alt="360 degree panoramic view of a car interior"
                isActive={activeTab === "interior"}
              />
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-center gap-8 border-b border-zinc-200">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleTabClick(tab.id)}
              className={`-mb-px border-b-2 pb-3 text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-zinc-900 text-zinc-900"
                  : "border-transparent text-zinc-400 hover:text-zinc-600"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
