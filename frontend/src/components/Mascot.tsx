"use client";

import React from "react";

export function SheepIcon({ size = 18, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      className={`psheep shrink-0 select-none w-mono ${className}`}
      width={size}
      height={size}
      viewBox="420.2 207.1 333.1 333.1"
      style={{ overflow: "hidden" }}
    >
      <g style={{ transformBox: "view-box", transformOrigin: "0 0" }} transform="rotate(9 588.7 385.8)">
        <use className="s-fleece-whole" fill="var(--sheep-fleece)" href="#psheep-2" />
        <use className="s-fleece-cut" fill="var(--sheep-fleece)" href="#psheep-2" mask="url(#psheep-icon-hole)" />
        <use
          className="s-face"
          fill="var(--sheep-face)"
          href="#psheep-3"
          style={{ transformBox: "view-box", transformOrigin: "0 0" }}
          transform="translate(583.3 388.6) scale(0.9) translate(-583.3 -388.6) translate(0 -14)"
        />
      </g>
    </svg>
  );
}

export function PlyxlLogo({ height = 22, className = "" }: { height?: number; className?: string }) {
  const width = height * (72.2 / 22);
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <svg
        aria-label="Plyxl"
        className="psheep shrink-0 select-none p-logo w-mono a-breathe a-blink h-lockup-word-wobble psheep-live"
        height={height}
        width={width}
        viewBox="417.2 233.76 1133.31 345.34"
        style={{ overflow: "visible" }}
      >
        <ellipse className="s-shadow" cx="590" cy="574" fill="var(--sheep-legs)" fillOpacity="0.18" opacity="0" rx="105" ry="7" />
        <g className="s-rig">
          <g className="s-squash">
            <g className="s-legs-cut" mask="url(#psheep-legs-logo)">
              <g className="s-legs" fill="var(--sheep-legs)">
                <use href="#psheep-7" />
                <use href="#psheep-8" />
              </g>
            </g>
            <g className="s-turn">
              <g className="s-tilt">
                <g className="s-body">
                  <use className="s-fleece s-fleece-whole" fill="var(--sheep-fleece)" href="#psheep-2" />
                  <use className="s-fleece s-fleece-cut" fill="var(--sheep-fleece)" href="#psheep-2" mask="url(#psheep-hole)" />
                  <g className="s-head">
                    <g className="s-lift" transform="translate(0 -14)">
                      <use className="s-face" fill="var(--sheep-face)" href="#psheep-3" />
                      <g className="s-features" fill="var(--sheep-feature)">
                        <g className="s-eye-l">
                          <path className="s-eye" d="M 531 393.5 A 14.1 14.1 0 1 0 559.2 393.5 A 14.1 14.1 0 1 0 531 393.5 Z" />
                        </g>
                        <g className="s-eye-r">
                          <circle className="s-eye s-eye-r-open" cx="624" cy="381" r="14.1" />
                        </g>
                        <g className="s-mouth-g">
                          <use className="s-mouth" fillRule="evenodd" href="#psheep-5" />
                          <use className="s-tongue" fill="var(--sheep-tongue)" href="#psheep-6" />
                        </g>
                        <path className="s-m-smile" d="M 564.2 423.8 Q 591.3 441.8 611.6 416.3" fill="none" stroke="var(--sheep-feature)" strokeWidth="8" strokeLinecap="round" />
                      </g>
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
        <g className="s-word-g">
          <use className="s-word s-word-0" fill="var(--sheep-word)" href="#psheep-9" />
          <use className="s-word s-word-1" fill="var(--sheep-word)" href="#psheep-10" />
          <use className="s-word s-word-2" fill="var(--sheep-word)" href="#psheep-11" />
          <use className="s-word s-word-3" fill="var(--sheep-word)" href="#psheep-12" />
          <use className="s-word s-word-4" fill="var(--sheep-word)" href="#psheep-13" />
        </g>
      </svg>
    </div>
  );
}

export function AgentBust({ size = 96, className = "" }: { size?: number; className?: string }) {
  return (
    <svg
      aria-label="Hashira Agent"
      className={`psheep shrink-0 select-none p-rest c-bust w-mono a-breathe a-blink psheep-live ${className}`}
      width={size}
      height={size}
      viewBox="410.2 197.1 353.1 353.1"
      style={{ overflow: "hidden" }}
    >
      <ellipse className="s-shadow" cx="590" cy="574" fill="var(--sheep-legs)" fillOpacity="0.18" opacity="0" rx="105" ry="7" />
      <g className="s-rig">
        <g className="s-squash">
          <g className="s-legs-cut" mask="url(#psheep-legs-rest)">
            <g className="s-legs" fill="var(--sheep-legs)">
              <use href="#psheep-0" />
              <use href="#psheep-1" />
            </g>
          </g>
          <g className="s-turn" transform="rotate(9 588.7 385.8)">
            <g className="s-tilt">
              <g className="s-body">
                <use className="s-fleece s-fleece-whole" fill="var(--sheep-fleece)" href="#psheep-2" />
                <use className="s-fleece s-fleece-cut" fill="var(--sheep-fleece)" href="#psheep-2" mask="url(#psheep-hole)" />
                <g className="s-head">
                  <g className="s-lift" transform="translate(0 -14)">
                    <use className="s-face" fill="var(--sheep-face)" href="#psheep-3" />
                    <g className="s-features" fill="var(--sheep-feature)">
                      <g className="s-eye-l">
                        <path className="s-eye" d="M 531 393.5 A 14.1 14.1 0 1 0 559.2 393.5 A 14.1 14.1 0 1 0 531 393.5 Z" />
                      </g>
                      <g className="s-eye-r">
                        <circle className="s-eye s-eye-r-open" cx="624" cy="381" r="14.1" />
                      </g>
                      <g className="s-mouth-g">
                        <use className="s-mouth" fillRule="evenodd" href="#psheep-5" />
                        <use className="s-tongue" fill="var(--sheep-tongue)" href="#psheep-6" />
                      </g>
                      <path className="s-m-smile" d="M 564.2 423.8 Q 591.3 441.8 611.6 416.3" fill="none" stroke="var(--sheep-feature)" strokeWidth="8" strokeLinecap="round" />
                    </g>
                  </g>
                </g>
              </g>
            </g>
          </g>
        </g>
      </g>
    </svg>
  );
}
