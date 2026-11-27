'use client';

import { useMemo } from 'react';
import { CapabilityNote } from '@/components/capability-note';
import { PromptPreview } from '@/components/prompt-preview';
import { ShotEditor } from '@/components/shot-editor';
import { StepForm } from '@/components/step-form';
import { Button } from '@/components/ui/button';
import { buildVideoPrompt } from '@/lib/builders/video';
import { buildGeneralPrompt } from '@/lib/builders/general';
import { checkVideoCapabilities } from '@/lib/capabilities';
import type { AspectRatio } from '@/lib/capabilities';
import { useStudioStore } from '@/stores/studio-store';

const inputCls =
  'w-full rounded border px-3 py-2 text-sm dark:bg-neutral-900 dark:border-neutral-700';
const labelCls = 'block text-sm font-medium mb-1';

export default function StudioPage() {
  const { scenario, step, setStep, videoParams, setVideoParams, addHistory } =
    useStudioStore();

  const built = useMemo(
    () =>
      scenario === 'video'
        ? buildVideoPrompt(videoParams)
        : buildGeneralPrompt({
            idea: videoParams.idea,
            context: '',
            outputFormat: '',
            constraints: '',
          }),
    [scenario, videoParams],
  );

  const warnings = useMemo(
    () =>
      scenario === 'video'
        ? checkVideoCapabilities({
            durationSeconds: videoParams.durationSeconds,
            aspectRatio: videoParams.aspectRatio as AspectRatio,
            requestedResolution: videoParams.requestedResolution,
          })
        : [],
    [scenario, videoParams],
  );

  const save = () => {
    if (!built.zh) return;
    addHistory({
      id: `${Date.now()}`,
      scenario,
      zh: built.zh,
      en: built.en,
      createdAt: Date.now(),
    });
  };

  if (scenario !== 'video') {
    return (
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h1 className="text-xl font-bold">通用创作</h1>
          <p className="text-sm text-neutral-500">
            该场景的专属表单在后续迭代补齐，骨架阶段先用通用表单。
          </p>
          <label className={labelCls}>你的想法（必填）</label>
          <textarea
            className={inputCls}
            rows={5}
            value={videoParams.idea}
            onChange={(e) => setVideoParams({ idea: e.target.value })}
            placeholder="用大白话写下你想让 Muse 做什么"
          />
        </div>
        <div className="space-y-3">
          <PromptPreview built={built} scenario={scenario} />
          <Button variant="secondary" onClick={save}>
            保存到历史
          </Button>
        </div>
      </div>
    );
  }

  const steps = [
    {
      title: '想法与规格',
      content: (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>你的想法（必填）</label>
            <textarea
              className={inputCls}
              rows={3}
              value={videoParams.idea}
              onChange={(e) => setVideoParams({ idea: e.target.value })}
              placeholder="例如：跟着一个女生在金融区街头走一段路，手机随手拍质感"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className={labelCls}>时长（秒）</label>
              <input
                type="number"
                min={1}
                max={120}
                className={inputCls}
                value={videoParams.durationSeconds}
                onChange={(e) =>
                  setVideoParams({ durationSeconds: Number(e.target.value) })
                }
              />
            </div>
            <div>
              <label className={labelCls}>画幅</label>
              <select
                className={inputCls}
                value={videoParams.aspectRatio}
                onChange={(e) =>
                  setVideoParams({
                    aspectRatio: e.target.value as typeof videoParams.aspectRatio,
                  })
                }
              >
                <option value="16:9">16:9 横屏</option>
                <option value="9:16">9:16 竖屏</option>
                <option value="1:1">1:1 方形</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>风格</label>
              <select
                className={inputCls}
                value={videoParams.style}
                onChange={(e) => setVideoParams({ style: e.target.value })}
              >
                <option>写实</option>
                <option>电影感</option>
                <option>纪录片</option>
              </select>
            </div>
          </div>
          <div>
            <label className={labelCls}>期望分辨率（可选，填了会触发真实性提醒）</label>
            <input
              className={inputCls}
              value={videoParams.requestedResolution ?? ''}
              onChange={(e) =>
                setVideoParams({
                  requestedResolution: e.target.value || undefined,
                })
              }
              placeholder="例如：4K / 1920×1080"
            />
          </div>
        </div>
      ),
    },
    {
      title: '画面',
      content: (
        <div className="space-y-4">
          {(
            [
              ['subject', '主体', '人物 / 物体的外观、服装、状态'],
              ['environment', '环境', '地点、背景、道具细节'],
              ['lighting', '光线', '时间、光源、色调'],
              ['cameraMovement', '镜头', '机位、运动方式、手持或固定'],
            ] as const
          ).map(([key, label, ph]) => (
            <div key={key}>
              <label className={labelCls}>{label}</label>
              <textarea
                className={inputCls}
                rows={2}
                value={videoParams[key]}
                onChange={(e) => setVideoParams({ [key]: e.target.value })}
                placeholder={ph}
              />
            </div>
          ))}
        </div>
      ),
    },
    {
      title: '分镜',
      content: (
        <ShotEditor
          shots={videoParams.shots}
          targetDuration={videoParams.durationSeconds}
          onChange={(shots) => setVideoParams({ shots })}
        />
      ),
    },
    {
      title: '音频与负面提示词',
      content: (
        <div className="space-y-4">
          <div>
            <label className={labelCls}>音频</label>
            <textarea
              className={inputCls}
              rows={2}
              value={videoParams.audio}
              onChange={(e) => setVideoParams({ audio: e.target.value })}
              placeholder="环境声、音乐、旁白；不需要就写无音乐"
            />
          </div>
          <div>
            <label className={labelCls}>负面提示词（留空时写实风格会自动补全）</label>
            <textarea
              className={inputCls}
              rows={2}
              value={videoParams.negativePrompt}
              onChange={(e) => setVideoParams({ negativePrompt: e.target.value })}
              placeholder="不想出现的东西，如：文字、水印、塑料质感"
            />
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <h1 className="mb-4 text-xl font-bold">视频创作</h1>
        <StepForm
          steps={steps}
          current={step}
          onStepChange={setStep}
          canNext={step > 0 || videoParams.idea.trim().length > 0}
          nextHint={step === 0 ? '先写下你的想法' : undefined}
        />
      </div>
      <div className="space-y-3">
        <CapabilityNote warnings={warnings} />
        <PromptPreview built={built} scenario={scenario} />
        <Button variant="secondary" onClick={save}>
          保存到历史
        </Button>
      </div>
    </div>
  );
}
