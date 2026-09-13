import React from "react";

export interface IllustrationProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "hero";
}

// 1. Astronaut Illustration (Directly inspired by Reference Screenshot #1)
export function AstronautIllustration({ className = "", size = "md" }: IllustrationProps) {
  return (
    <div
      className={`relative w-full h-full flex items-center justify-center bg-[#cbe1fb] overflow-hidden select-none ${className}`}
    >
      <svg
        viewBox="0 0 320 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain max-h-[260px] drop-shadow-sm transition-transform duration-500 hover:scale-105"
      >
        {/* Ambient floating space dust & stars */}
        <path
          d="M245 42L247 48L253 50L247 52L245 58L243 52L237 50L243 48L245 42Z"
          fill="#FBBF24"
        />
        <path
          d="M65 140L66.5 144L71 145.5L66.5 147L65 151L63.5 147L59 145.5L63.5 144L65 140Z"
          fill="#FBBF24"
        />
        <circle cx="270" cy="115" r="4" fill="#93C5FD" opacity="0.8" />
        <circle cx="50" cy="70" r="5" fill="#BFDBFE" opacity="0.7" />

        {/* Floating Asteroids */}
        <path
          d="M265 80C270 78 277 82 279 87C281 92 277 98 272 99C266 100 262 95 261 90C260 85 263 81 265 80Z"
          fill="#93C5FD"
        />
        <path
          d="M52 185C56 182 62 184 64 189C66 193 63 198 58 199C53 200 50 196 49 192C48 188 50 185 52 185Z"
          fill="#93C5FD"
        />

        {/* Astronaut Shadow */}
        <ellipse cx="160" cy="215" rx="55" ry="10" fill="#93C5FD" opacity="0.4" />

        {/* Astronaut Body - Suit */}
        {/* Legs */}
        <path
          d="M135 150C132 170 128 185 130 195C132 202 142 204 148 198C154 192 153 175 152 160"
          fill="#FFFFFF"
          stroke="#E2E8F0"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M170 150C175 168 182 184 186 193C190 200 200 199 202 192C204 185 196 170 188 155"
          fill="#FFFFFF"
          stroke="#E2E8F0"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Torso */}
        <path
          d="M132 105C130 135 135 162 160 162C185 162 190 135 188 105C188 95 132 95 132 105Z"
          fill="#FFFFFF"
          stroke="#E2E8F0"
          strokeWidth="3"
        />

        {/* Arms holding pink book */}
        <path
          d="M125 110C115 125 118 142 140 148"
          stroke="#FFFFFF"
          strokeWidth="18"
          strokeLinecap="round"
        />
        <path
          d="M195 110C205 125 200 142 178 148"
          stroke="#FFFFFF"
          strokeWidth="18"
          strokeLinecap="round"
        />

        {/* Pink Reading Book */}
        <g transform="translate(136, 118)">
          <path
            d="M24 0L4 12L4 44L24 32L44 44L44 12L24 0Z"
            fill="#F472B6"
            stroke="#EC4899"
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path d="M24 0V32" stroke="#DB2777" strokeWidth="2" />
          {/* Inner pages white edge */}
          <path d="M7 14L22 4V34L7 42V14Z" fill="#FCE7F3" opacity="0.6" />
          <path d="M41 14L26 4V34L41 42V14Z" fill="#FCE7F3" opacity="0.6" />
        </g>

        {/* Astronaut Helmet / Head */}
        <circle cx="160" cy="80" r="36" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="3" />
        {/* Navy Visor */}
        <circle cx="160" cy="80" r="26" fill="#1E293B" />
        {/* Visor Reflection Gloss */}
        <path
          d="M148 68C154 62 166 62 172 68C174 70 173 73 170 72C164 70 156 70 150 72C147 73 146 70 148 68Z"
          fill="#38BDF8"
          opacity="0.8"
        />
      </svg>
    </div>
  );
}

// 2. Rocket Illustration (Directly inspired by Reference Screenshot #2)
export function RocketIllustration({ className = "", size = "md" }: IllustrationProps) {
  return (
    <div
      className={`relative w-full h-full flex items-center justify-center bg-[#f9a8d4] overflow-hidden select-none ${className}`}
    >
      <svg
        viewBox="0 0 320 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain max-h-[260px] drop-shadow-sm transition-transform duration-500 hover:scale-105"
      >
        {/* Vapor Launch Smoke */}
        <circle cx="160" cy="205" r="26" fill="#FFFFFF" opacity="0.95" />
        <circle cx="132" cy="212" r="18" fill="#FDF2F8" opacity="0.9" />
        <circle cx="188" cy="212" r="18" fill="#FDF2F8" opacity="0.9" />
        <circle cx="112" cy="218" r="12" fill="#BAE6FD" opacity="0.8" />
        <circle cx="208" cy="218" r="12" fill="#BAE6FD" opacity="0.8" />

        {/* Exhaust Flame */}
        <path
          d="M150 168C150 168 154 195 160 198C166 195 170 168 170 168H150Z"
          fill="#38BDF8"
        />
        <path
          d="M154 168C154 168 157 186 160 188C163 186 166 168 166 168H154Z"
          fill="#FFFFFF"
        />

        {/* Rocket Wings */}
        <path
          d="M132 140C120 145 115 160 120 170C126 168 136 165 140 160L132 140Z"
          fill="#60A5FA"
        />
        <path
          d="M188 140C200 145 205 160 200 170C194 168 184 165 180 160L188 140Z"
          fill="#60A5FA"
        />

        {/* Rocket Main Body */}
        <path
          d="M160 55C140 85 136 130 138 168H182C184 130 180 85 160 55Z"
          fill="#FFFFFF"
          stroke="#E2E8F0"
          strokeWidth="3"
        />

        {/* Nose Cone */}
        <path
          d="M160 55C150 72 143 90 140 100H180C177 90 170 72 160 55Z"
          fill="#38BDF8"
        />

        {/* Porthole Window */}
        <circle cx="160" cy="122" r="14" fill="#3B82F6" stroke="#93C5FD" strokeWidth="3" />
        <circle cx="160" cy="122" r="9" fill="#1E293B" />
        <circle cx="157" cy="119" r="3" fill="#FFFFFF" opacity="0.9" />

        {/* Stars */}
        <circle cx="70" cy="65" r="4" fill="#FFFFFF" opacity="0.8" />
        <circle cx="250" cy="75" r="5" fill="#FFFFFF" opacity="0.8" />
        <circle cx="265" cy="150" r="3" fill="#FFFFFF" opacity="0.7" />
      </svg>
    </div>
  );
}

// 3. Desk / Tired Coder Illustration (Directly inspired by Reference Screenshot #3)
export function DeskIllustration({ className = "", size = "md" }: IllustrationProps) {
  return (
    <div
      className={`relative w-full h-full flex items-center justify-center bg-[#fcd34d] overflow-hidden select-none ${className}`}
    >
      <svg
        viewBox="0 0 320 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain max-h-[260px] drop-shadow-sm transition-transform duration-500 hover:scale-105"
      >
        {/* Computer Screen */}
        <rect
          x="165"
          y="95"
          width="80"
          height="60"
          rx="6"
          fill="#E0F2FE"
          stroke="#0284C7"
          strokeWidth="3"
        />
        <path d="M205 155V175H185V180H225V175H205" fill="#0284C7" />
        {/* Code lines on screen */}
        <rect x="175" y="108" width="40" height="4" rx="2" fill="#38BDF8" />
        <rect x="175" y="118" width="55" height="4" rx="2" fill="#0284C7" />
        <rect x="175" y="128" width="30" height="4" rx="2" fill="#F43F5E" />
        <circle cx="230" cy="138" r="5" fill="#F59E0B" />

        {/* Desk Surface */}
        <rect x="50" y="180" width="220" height="10" rx="3" fill="#B45309" />
        {/* Coffee Mug on desk */}
        <rect x="85" y="165" width="16" height="15" rx="3" fill="#FFFFFF" />
        <path
          d="M101 169C104 169 106 172 106 174C106 176 104 179 101 179"
          stroke="#FFFFFF"
          strokeWidth="2"
        />

        {/* Sleeping Coder Head resting on arms */}
        {/* Arm folded on desk */}
        <path
          d="M110 178C110 162 135 158 150 164C160 168 165 178 165 178"
          fill="#FED7AA"
          stroke="#EA580C"
          strokeWidth="2.5"
        />
        {/* Head */}
        <circle cx="132" cy="145" r="20" fill="#FED7AA" stroke="#EA580C" strokeWidth="2.5" />
        {/* Hair */}
        <path
          d="M115 142C112 130 125 124 140 126C152 128 154 138 150 144C140 135 125 138 115 142Z"
          fill="#1E293B"
        />
        {/* Sleeping Closed Eye */}
        <path d="M136 148C138 151 142 151 144 148" stroke="#7C2D12" strokeWidth="2" strokeLinecap="round" />

        {/* ZZZ Sleeping Bubble */}
        <g transform="translate(145, 80)">
          <circle cx="30" cy="20" r="18" fill="#FFFFFF" />
          <path
            d="M25 15H35L25 25H35"
            stroke="#3B82F6"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="18" cy="38" r="4" fill="#FFFFFF" />
          <circle cx="10" cy="46" r="2.5" fill="#FFFFFF" />
        </g>
      </svg>
    </div>
  );
}

// 4. Server / Distributed Systems Illustration
export function ServerIllustration({ className = "", size = "md" }: IllustrationProps) {
  return (
    <div
      className={`relative w-full h-full flex items-center justify-center bg-[#a7f3d0] overflow-hidden select-none ${className}`}
    >
      <svg
        viewBox="0 0 320 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain max-h-[260px] drop-shadow-sm transition-transform duration-500 hover:scale-105"
      >
        {/* Network Grid lines */}
        <path d="M60 120H100" stroke="#059669" strokeWidth="2" strokeDasharray="4 4" />
        <path d="M220 120H260" stroke="#059669" strokeWidth="2" strokeDasharray="4 4" />
        <path d="M160 50V75" stroke="#059669" strokeWidth="2" strokeDasharray="4 4" />

        {/* Main Server Rack */}
        <rect
          x="105"
          y="65"
          width="110"
          height="130"
          rx="10"
          fill="#064E3B"
          stroke="#047857"
          strokeWidth="3"
        />

        {/* Server Units (3 shelves) */}
        {/* Shelf 1 */}
        <rect x="115" y="80" width="90" height="28" rx="4" fill="#022C22" />
        <circle cx="130" cy="94" r="4" fill="#10B981" />
        <circle cx="142" cy="94" r="4" fill="#34D399" />
        <rect x="155" y="91" width="38" height="6" rx="3" fill="#065F46" />

        {/* Shelf 2 */}
        <rect x="115" y="116" width="90" height="28" rx="4" fill="#022C22" />
        <circle cx="130" cy="130" r="4" fill="#38BDF8" />
        <circle cx="142" cy="130" r="4" fill="#10B981" />
        <rect x="155" y="127" width="38" height="6" rx="3" fill="#065F46" />

        {/* Shelf 3 */}
        <rect x="115" y="152" width="90" height="28" rx="4" fill="#022C22" />
        <circle cx="130" cy="166" r="4" fill="#F59E0B" />
        <circle cx="142" cy="166" r="4" fill="#10B981" />
        <rect x="155" y="163" width="38" height="6" rx="3" fill="#065F46" />

        {/* Floating Data Cubes */}
        <rect
          x="55"
          y="85"
          width="32"
          height="32"
          rx="6"
          fill="#FFFFFF"
          stroke="#10B981"
          strokeWidth="2.5"
        />
        <rect
          x="235"
          y="135"
          width="32"
          height="32"
          rx="6"
          fill="#FFFFFF"
          stroke="#10B981"
          strokeWidth="2.5"
        />
      </svg>
    </div>
  );
}

// 5. Terminal / Code Illustration
export function TerminalIllustration({ className = "", size = "md" }: IllustrationProps) {
  return (
    <div
      className={`relative w-full h-full flex items-center justify-center bg-[#ddd6fe] overflow-hidden select-none ${className}`}
    >
      <svg
        viewBox="0 0 320 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain max-h-[260px] drop-shadow-sm transition-transform duration-500 hover:scale-105"
      >
        {/* Terminal Window */}
        <rect
          x="65"
          y="45"
          width="190"
          height="145"
          rx="12"
          fill="#1E1B4B"
          stroke="#4C1D95"
          strokeWidth="3"
        />
        {/* Terminal Top Bar */}
        <rect x="65" y="45" width="190" height="28" rx="12" fill="#2E1065" />
        <circle cx="85" cy="59" r="4" fill="#F43F5E" />
        <circle cx="97" cy="59" r="4" fill="#FBBF24" />
        <circle cx="109" cy="59" r="4" fill="#10B981" />

        {/* Terminal Text Lines */}
        <text x="85" y="98" fill="#A78BFA" fontSize="13" fontFamily="monospace" fontWeight="bold">
          $ lock.acquire()
        </text>
        <text x="85" y="122" fill="#34D399" fontSize="13" fontFamily="monospace">
          &gt; OK (resource_42)
        </text>
        <text x="85" y="146" fill="#F472B6" fontSize="13" fontFamily="monospace">
          $ process_events()
        </text>
        <rect x="180" y="137" width="8" height="12" fill="#A78BFA" />

        {/* Key / Lock icon overlay */}
        <circle cx="230" cy="165" r="18" fill="#FBBF24" stroke="#D97706" strokeWidth="2.5" />
        <circle cx="230" cy="161" r="5" fill="#78350F" />
        <rect x="228" y="164" width="4" height="8" fill="#78350F" />
      </svg>
    </div>
  );
}

// 6. Coffee / Clean Architecture Illustration
export function CoffeeIllustration({ className = "", size = "md" }: IllustrationProps) {
  return (
    <div
      className={`relative w-full h-full flex items-center justify-center bg-[#fed7aa] overflow-hidden select-none ${className}`}
    >
      <svg
        viewBox="0 0 320 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain max-h-[260px] drop-shadow-sm transition-transform duration-500 hover:scale-105"
      >
        {/* Steam Wisps */}
        <path
          d="M145 60C140 70 150 78 145 88"
          stroke="#F97316"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M160 52C155 65 165 74 160 88"
          stroke="#F97316"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M175 60C170 70 180 78 175 88"
          stroke="#F97316"
          strokeWidth="3"
          strokeLinecap="round"
        />

        {/* Coffee Cup */}
        <rect x="125" y="95" width="70" height="65" rx="10" fill="#FFFFFF" stroke="#EA580C" strokeWidth="3" />
        {/* Cup Handle */}
        <path
          d="M195 108C210 108 215 138 195 142"
          stroke="#EA580C"
          strokeWidth="4"
          strokeLinecap="round"
        />
        {/* Saucer */}
        <ellipse cx="160" cy="165" rx="55" ry="8" fill="#FFFFFF" stroke="#EA580C" strokeWidth="3" />

        {/* Architectural Hexagon Badge on Cup */}
        <polygon
          points="160,112 172,118 172,132 160,138 148,132 148,118"
          fill="#FED7AA"
          stroke="#C2410C"
          strokeWidth="2"
        />
      </svg>
    </div>
  );
}

// Master ArticleIllustration Switcher Component
export function ArticleIllustration({
  type = "astronaut",
  className = "",
  size = "md",
}: {
  type?: string | null;
  className?: string;
  size?: "sm" | "md" | "lg" | "hero";
}) {
  switch (type?.toLowerCase()) {
    case "astronaut":
      return <AstronautIllustration className={className} size={size} />;
    case "rocket":
      return <RocketIllustration className={className} size={size} />;
    case "desk":
      return <DeskIllustration className={className} size={size} />;
    case "server":
      return <ServerIllustration className={className} size={size} />;
    case "terminal":
      return <TerminalIllustration className={className} size={size} />;
    case "coffee":
      return <CoffeeIllustration className={className} size={size} />;
    default:
      return <AstronautIllustration className={className} size={size} />;
  }
}
