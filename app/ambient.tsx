/** Quiet, decorative paper-and-light composition. No client runtime needed. */
export default function Ambient() {
  return (
    <div className="ambient-scene" aria-hidden="true">
      <div className="ambient-daylight" />
      <svg className="ambient-lines" viewBox="0 0 800 1000" fill="none" focusable="false">
        <g stroke="currentColor" strokeWidth="0.7">
          <path d="M784 18C480 40 254 198 293 388S661 608 588 833 232 996 88 1004" />
          <path d="M800 49C514 59 284 206 321 389S674 602 608 830 272 1020 108 1034" />
          <path d="M816 80C548 78 314 214 349 390S687 596 628 827 312 1044 128 1064" />
          <path d="M832 111C582 97 344 222 377 391S700 590 648 824 352 1068 148 1094" />
          <path d="M848 142C616 116 374 230 405 392S713 584 668 821 392 1092 168 1124" />
          <path d="M864 173C650 135 404 238 433 393S726 578 688 818 432 1116 188 1154" />
          <path d="M880 204C684 154 434 246 461 394S739 572 708 815 472 1140 208 1184" />
          <path d="M896 235C718 173 464 254 489 395S752 566 728 812 512 1164 228 1214" />
          <path d="M912 266C752 192 494 262 517 396S765 560 748 809 552 1188 248 1244" />
        </g>
        <circle cx="352" cy="252" r="3" fill="currentColor" />
        <path d="M338 252h28m-14-14v28" stroke="currentColor" strokeWidth=".6" />
      </svg>
      <div className="ambient-grain" />
    </div>
  );
}
