import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, Scrollbar } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import "swiper/css/scrollbar";
import "swiper/css/autoplay";
import { useState } from "react";

function RenderLenses({ lenses, isSelectedLens }) {
  const [swiper, setSwiper] = useState(null);

  return (
    <div className="bg-transparent absolute bottom-50% right-6 xl:right-[200px]">
      <Swiper
        modules={[Navigation, Pagination, Scrollbar]}
        spaceBetween={10}
        direction="vertical"
        slidesPerView={3}
        onSwiper={(s) => {
          setSwiper(s);
        }}
        className="swiper mr-0 flex flex-col justify-center items-end w-20 h-[250px] bg-transparent"
      >
        {lenses.map((lens, index) => (
          <SwiperSlide className={`w-20 rounded-full`} key={lens.id}>
            <img
              id={lens.id}
              src={lens.iconUrl}
              alt={lens.name}
              className={`selectLens transition-all
                        ${
                          isSelectedLens === index
                            ? `w-20 h-20 rounded-full cursor-pointer p-1 border-red-500 border-[1px] bg-transparent ml-auto`
                            : `w-12 h-12 rounded-full cursor-pointer mt-4 bg-transparent ml-auto`
                        }`}
            />
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}

export default RenderLenses;
