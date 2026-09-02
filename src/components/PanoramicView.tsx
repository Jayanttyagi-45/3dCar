'use client';

import { useEffect, useRef } from 'react';
import { ReactPhotoSphereViewer } from 'react-photo-sphere-viewer';
import { AutorotatePlugin } from '@photo-sphere-viewer/autorotate-plugin';
import type { Viewer } from '@photo-sphere-viewer/core';
import '@photo-sphere-viewer/core/index.css';

interface PanoramicViewProps {
  imageUrl: string;
  alt: string;
  isActive?: boolean;
}

export default function PanoramicView({ imageUrl, alt, isActive = true }: PanoramicViewProps) {
  const viewerRef = useRef<Viewer | null>(null);

  useEffect(() => {
    if (isActive) {
      viewerRef.current?.getPlugin<AutorotatePlugin>(AutorotatePlugin)?.start();
    }
  }, [isActive]);

  return (
    <div className="mx-auto aspect-[4/3] w-full max-w-5xl overflow-hidden rounded-lg">
      <ReactPhotoSphereViewer
        src={imageUrl}
        caption={alt}
        height="100%"
        width="100%"
        loadingTxt="Loading panorama..."
        navbar={false}
        onReady={(instance) => {
          viewerRef.current = instance;
        }}
        plugins={[
          [
            AutorotatePlugin,
            {
              autostartDelay: 500,
              autostartOnIdle: false,
              autorotateSpeed: '2rpm',
            },
          ],
        ]}
      />
    </div>
  );
}
