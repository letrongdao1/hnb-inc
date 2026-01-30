"use client";

import {
  DHBCQuiz,
  DHBCQuizSubmission,
  DHBCQuizSubmissionStatus,
  DHBCQuizWord,
  DHBCQuizWordExplanationType,
} from "@/interfaces/dhbc";
import {
  addToast,
  Button,
  Form,
  Image,
  Input,
  Popover,
  PopoverContent,
  PopoverTrigger,
  Spinner,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { EraseIcon, ExclamationIcon, ShapesIcon, TriangleFlagIcon } from "../svg";
import { STATUS_CODE } from "@/constants/enums";
import DHBCEmptyQuiz from "./EmptyQuiz";
import ImagePreviewModal from "../ui/preview-modal";
import DHBCWaitSection from "./WaitSection";
import { useReward } from "react-rewards";

type DHBCMainSectionProps = {
  quiz: DHBCQuiz;
  currentSubmission?: DHBCQuizSubmission;
  nextQuizStartTime: string;
};

const rewardConfigProps = {
  elementCount: 200,
  elementSize: 10,
  zIndex: 9999,
  spread: 180,
  lifetime: 1000,
};

const containerClassname = "flex w-full flex-col items-center gap-4 lg:max-w-3/4 xl:max-w-2/3";

export default function DHBCMainSection({
  quiz,
  currentSubmission,
  nextQuizStartTime,
}: DHBCMainSectionProps) {
  const [isReady, setIsReady] = useState<boolean>(false);
  const [rightWordCount, setRightWordCount] = useState<number>(0);
  const [totalTrialCount, setTotalTrialCount] = useState<number>(0);
  const [currentPreviewSrc, setCurrentPreviewSrc] = useState<string>();
  const [answerWords, setAnswerWords] = useState<DHBCQuizWord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const previewImageModal = useDisclosure();

  const finishContainerRef = useRef<HTMLDivElement>(null);

  const { reward } = useReward("rewardId", "confetti", rewardConfigProps);
  const { reward: emojiReward } = useReward("emojiRewardId", "emoji", {
    ...rewardConfigProps,
    elementCount: 100,
    elementSize: 24,
    emoji: ["🎯"],
  });

  const isFinished = useMemo(
    () => answerWords.length && quiz.words.length === answerWords.length,
    [quiz, answerWords]
  );

  useEffect(() => {
    if (!isReady) return;

    const handleBeforeUnload = (e: any) => {
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    if (isFinished) window.removeEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [isReady, isFinished]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const data = Object.fromEntries(new FormData(e.currentTarget));

    const guessPayload = {
      quiz: quiz.id,
      words: Object.values(data),
    };

    setLoading(true);
    await fetch("/api/dhbc/guess", {
      method: "POST",
      body: JSON.stringify(guessPayload),
    })
      .then((res) => res.json())
      .then((result) => {
        if (result.status !== STATUS_CODE.OK) {
          addToast({ title: result.message, color: "danger" });
          return;
        }

        if (!result.data || result.data.rightWordCount === undefined) {
          addToast({ title: "Không lấy được thông tin đáp án!", color: "danger" });
          return;
        }

        setTotalTrialCount((prev) => prev + 1);
        setRightWordCount(result.data.rightWordCount);

        if (
          result.data.rightWordCount === quiz.words.length &&
          result.data.answerWords &&
          result.data.answerWords.length
        ) {
          setAnswerWords(result.data.answerWords);
          setTimeout(() => {
            finishContainerRef.current?.scrollIntoView({ behavior: "smooth" });
          }, 500);

          reward();
          if (totalTrialCount === 0) emojiReward();
        }
      })
      .finally(() => setLoading(false));
  };

  const handleReady = () => {
    if (currentSubmission) {
      setRightWordCount(0);
      setTotalTrialCount(currentSubmission.total_trial);
    }

    setIsReady(true);
  };

  const getNextDateStartTime = (time: string) => {
    const next = new Date(time);
    next.setDate(next.getDate() + 1);

    return next.toISOString();
  };

  if (!quiz) return <DHBCEmptyQuiz />;

  if (currentSubmission && currentSubmission.status === DHBCQuizSubmissionStatus.DONE && !isReady) {
    return (
      <div className={`${containerClassname}`}>
        <div className="flex items-stretch justify-center gap-2">
          {quiz.words.map((word, index) => (
            <div key={index} className="flex flex-col items-center justify-start gap-2 sm:gap-4">
              <Image
                src={word.image_url}
                alt=""
                className="border-default-200 aspect-square w-20 cursor-pointer rounded-md border-2 object-cover sm:w-32"
                onClick={() => {
                  setCurrentPreviewSrc(word.image_url);
                  previewImageModal.onOpen();
                }}
              />

              <p className="text-center font-bold uppercase sm:text-xl">{word.word}</p>
            </div>
          ))}
        </div>

        <DHBCWaitSection nextQuizStartTime={getNextDateStartTime(nextQuizStartTime)} />
      </div>
    );
  }

  if (!isReady)
    return (
      <div className={`${containerClassname} my-auto`}>
        <div className="mb-4 flex items-stretch justify-center gap-1">
          {quiz.words.map((word) => (
            <Image
              key={word.id}
              src={word.image_url}
              alt=""
              className="border-default-200 aspect-square w-24 cursor-pointer rounded-md border-2 object-cover blur-sm sm:w-40"
            />
          ))}
        </div>
        <p className="text-2xl font-semibold uppercase">
          {currentSubmission ? "Tiếp tục" : "Bắt đầu"} thi đấu
        </p>
        <Button
          variant="shadow"
          color="success"
          className="font-semibold text-white"
          onPress={handleReady}
        >
          Hmm
        </Button>
      </div>
    );

  return (
    <div className={`${containerClassname}`}>
      <span id="rewardId" className="self-center" />
      <span id="emojiRewardId" className="self-center" />

      <div className="flex w-full items-stretch justify-center gap-2">
        {totalTrialCount > 0 ? (
          <>
            <div
              className={`flex flex-1 flex-col items-center justify-center rounded-md p-2 ${rightWordCount === quiz.words.length ? "bg-green-700 text-white" : "border-2 border-green-700"}`}
            >
              <p className="text-default-600 text-sm whitespace-nowrap">Số từ đúng</p>
              <div className="text-[3em] font-bold">
                {loading ? <Spinner variant="simple" color="success" /> : rightWordCount}
              </div>
            </div>

            <div className="flex flex-1 flex-col items-center justify-center rounded-md bg-sky-700 p-2">
              <p className="text-default-600 text-sm whitespace-nowrap">Số lần đã đoán</p>
              <p className="text-[3em] font-bold">{totalTrialCount}</p>
            </div>
          </>
        ) : (
          <p className="border-default-500 flex flex-1 items-center justify-center gap-2 rounded-md border p-8 text-lg font-semibold">
            <TriangleFlagIcon className="hidden sm:inline" />
            1... 2... 3... BẮT ĐẦU THI ĐẤU
          </p>
        )}
      </div>

      <Form onSubmit={handleSubmit} className="flex w-full flex-col items-stretch gap-8">
        <div className="flex flex-col items-stretch justify-center gap-8 sm:flex-row sm:gap-2">
          {quiz.words.map((word, index) => (
            <div key={index} className="flex flex-col items-center justify-start gap-2 sm:gap-8">
              <Image
                src={word.image_url}
                alt=""
                className="border-default-200 aspect-square w-40 cursor-pointer rounded-md border-2 object-cover sm:w-56"
                onClick={() => {
                  setCurrentPreviewSrc(word.image_url);
                  previewImageModal.onOpen();
                }}
              />
              {isFinished ? (
                <div className="flex items-center justify-center gap-2 self-stretch rounded-md bg-green-600 p-2">
                  <p className="text-center text-xl font-bold text-white uppercase">
                    {answerWords[index].word}
                  </p>

                  {answerWords[index].explanation && (
                    <Popover placement="top">
                      <PopoverTrigger>
                        <ExclamationIcon size={16} fill="#fff" className="cursor-pointer" />
                      </PopoverTrigger>
                      <PopoverContent className="bg-white text-black">
                        <div className="px-1 py-2">
                          {answerWords[index].explanation_type ===
                          DHBCQuizWordExplanationType.WORD ? (
                            answerWords[index].explanation
                          ) : (
                            <Image
                              src={answerWords[index].explanation}
                              alt=""
                              className="border-default-200 aspect-square w-40 cursor-pointer rounded-md border-2 object-cover"
                              onClick={() => {
                                setCurrentPreviewSrc(answerWords[index].explanation);
                                previewImageModal.onOpen();
                              }}
                            />
                          )}
                        </div>
                      </PopoverContent>
                    </Popover>
                  )}
                </div>
              ) : (
                <Input
                  name={`word-${index}`}
                  variant="faded"
                  style={{ textAlign: "center" }}
                  isRequired
                  errorMessage={<></>}
                  autoComplete="off"
                  isClearable
                />
              )}
            </div>
          ))}
        </div>

        {!isFinished ? (
          <div className="flex flex-col items-stretch gap-1">
            <Button
              isDisabled={loading}
              isLoading={loading}
              type="submit"
              color="success"
              fullWidth
              startContent={!loading && <ShapesIcon size={16} />}
              className="mx-auto font-semibold"
            >
              CHỐT
            </Button>
            <div className="flex items-stretch gap-2">
              <Button
                type="reset"
                color="default"
                variant="faded"
                className="mx-auto flex-1 text-xs"
                startContent={<EraseIcon size={16} />}
              >
                Xóa hết
              </Button>

              <Tooltip content="Luật thi đấu">
                <Button color="default" variant="faded" isIconOnly startContent={<span>?</span>} />
              </Tooltip>
            </div>
          </div>
        ) : (
          <div ref={finishContainerRef} className="flex flex-col items-center justify-start gap-8">
            {answerWords.length && (
              <div className="border-default-300 flex flex-col items-stretch gap-1 rounded-md border p-6 shadow-2xl sm:p-8">
                <p className="text-sm font-light opacity-75">Đáp án hôm nay:</p>
                <p className="text-2xl font-semibold uppercase">
                  {answerWords.map((word) => word.word).join(" ")}
                </p>
              </div>
            )}

            <DHBCWaitSection nextQuizStartTime={getNextDateStartTime(nextQuizStartTime)} />
          </div>
        )}
      </Form>

      <ImagePreviewModal
        isOpen={previewImageModal.isOpen}
        onOpenChange={previewImageModal.onOpenChange}
        onClose={() => {
          setCurrentPreviewSrc(undefined);
          previewImageModal.onClose();
        }}
        src={currentPreviewSrc}
        alt="preview"
      />
    </div>
  );
}
