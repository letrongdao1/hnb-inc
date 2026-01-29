"use client";

import React, { useState } from "react";
import THINKING_IMG from "@/assets/images/thinking.png";
import { motion } from "framer-motion";
import { Button, Image } from "@heroui/react";

export default function DHBCEmptyQuiz() {
  const [count, setCount] = useState<number>(0);

  return (
    <div className="flex flex-col items-center justify-center gap-4 p-4">
      <Image src={THINKING_IMG.src} alt="" className="w-64" />
      <div className="space-y-2 text-center lg:max-w-[30vw]">
        <p className="text-xl font-bold uppercase">Hiện tại chưa có đề bài</p>
        <p className="text-sm font-light">
          BTC sẽ sớm cập nhật đề bài để đảm bảo chất lượng cho quá trình luyện tập của các thí sinh.
        </p>
      </div>

      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className={`text-sm font-semibold`}
        >
          &#34;Xin lỗi vì sự bất tiện này!&#34;{" "}
          <span className="text-xs font-medium">{count > 1 && `x${count}`}</span>
        </motion.div>
      )}

      <Button
        color="default"
        startContent={<span>&#128078;</span>}
        onPress={() => setCount((prev) => prev + 1)}
      >
        ĐM BTC
      </Button>
    </div>
  );
}
