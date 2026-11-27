'use client';

import { useMemo } from 'react';
import { CapabilityNote } from '@/components/capability-note';
import { PromptPreview } from '@/components/prompt-preview';
import { ShotEditor } from '@/components/shot-editor';
import { SmartComplete } from '@/components/smart-complete';
import { StepForm } from '@/components/step-form';
import { Button } from '@/components/ui/button';
import { buildDocumentPrompt } from '@/lib/builders/document';
import { buildGeneralPrompt } from '@/lib/builders/general';
import { buildImagePrompt } from '@/lib/builders/image';
import { buildTripPrompt } from '@/lib/builders/trip';
import { buildVideoPrompt, type BuiltPrompt } from '@/lib/builders/video';
import { checkVideoCapabilities } from '@/lib/capabilities';
import type { AspectRatio } from '@/lib/capabilities';
import { useStudioStore } from '@/stores/studio-store';

const inputCls =
  'w-full rounded border px-3 py-2 text-sm dark:bg-neutral-900 dark:border-neutral-700';
const labelCls = 'block text-sm font-medium mb-1';

const TITLES: Record<string, string> = {
  video: '视频创作',
  image: '图片创作',
  document: '文档写作',
  trip: '行程规划',
  general: '通用任务',
};

function TextField({
  label,
  value,
  onChange,
  placeholder,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label className={labelCls}>{label}</label>
      <textarea
        className={inputCls}
        rows={rows}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </div>
  );
}

export default function StudioPage() {
  const store = useStudioStore();
  const {
    scenario,
    step,
    setStep,
    videoParams,
    setVideoParams,
    imageParams,
    setImageParams,
    documentParams,
    setDocumentParams,
    tripParams,
    setTripParams,
    generalIdea,
    setGeneralIdea,
    addHistory,
  } = store;

  const built: BuiltPrompt = useMemo(() => {
    switch (scenario) {
      case 'video':
        return buildVideoPrompt(videoParams);
      case 'image':
        return buildImagePrompt(imageParams);
      case 'document':
        return buildDocumentPrompt(documentParams);
      case 'trip':
        return buildTripPrompt(tripParams);
      case 'general':
        return buildGeneralPrompt({
          idea: generalIdea,
          context: '',
          outputFormat: '',
          constraints: '',
        });
    }
  }, [scenario, videoParams, imageParams, documentParams, tripParams, generalIdea]);

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

  const ideaFilled =
    (scenario === 'video' && videoParams.idea.trim().length > 0) ||
    (scenario === 'image' && imageParams.idea.trim().length > 0) ||
    (scenario === 'document' && documentParams.idea.trim().length > 0) ||
    (scenario === 'trip' && tripParams.idea.trim().length > 0) ||
    (scenario === 'general' && generalIdea.trim().length > 0);

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

  // ---- per-scenario smart completion wiring ----
  const completion = (() => {
    switch (scenario) {
      case 'video':
        return {
          getFields: () => ({
            style: videoParams.style,
            negativePrompt: videoParams.negativePrompt,
            audio: videoParams.audio,
            lighting: videoParams.lighting,
          }),
          apply: (c: Record<string, string>) =>
            setVideoParams({
              negativePrompt: c.negativePrompt ?? videoParams.negativePrompt,
              audio: c.audio ?? videoParams.audio,
              lighting: c.lighting ?? videoParams.lighting,
            }),
        };
      case 'image':
        return {
          getFields: () => ({
            style: imageParams.style,
            negativePrompt: imageParams.negativePrompt,
            lighting: imageParams.lighting,
          }),
          apply: (c: Record<string, string>) =>
            setImageParams({
              negativePrompt: c.negativePrompt ?? imageParams.negativePrompt,
              lighting: c.lighting ?? imageParams.lighting,
            }),
        };
      case 'document':
        return {
          getFields: () => ({
            tone: documentParams.tone,
            lengthHint: documentParams.lengthHint,
          }),
          apply: (c: Record<string, string>) =>
            setDocumentParams({
              tone: c.tone ?? documentParams.tone,
              lengthHint: c.lengthHint ?? documentParams.lengthHint,
            }),
        };
      case 'trip':
        return {
          getFields: () => ({
            constraints: tripParams.constraints,
            interests: tripParams.interests,
          }),
          apply: (c: Record<string, string>) =>
            setTripParams({
              constraints: c.constraints ?? tripParams.constraints,
              interests: c.interests ?? tripParams.interests,
            }),
        };
      case 'general':
        return null;
    }
  })();

  // ---- per-scenario step forms ----
  let steps: { title: string; content: React.ReactNode }[] = [];

  if (scenario === 'video') {
    steps = [
      {
        title: '想法与规格',
        content: (
          <div className="space-y-4">
            <TextField
              label="你的想法（必填）"
              value={videoParams.idea}
              onChange={(v) => setVideoParams({ idea: v })}
              placeholder="例如：跟着一个女生在金融区街头走一段路，手机随手拍质感"
              rows={3}
            />
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
            <TextField
              label="期望分辨率（可选，填了会触发真实性提醒）"
              value={videoParams.requestedResolution ?? ''}
              onChange={(v) =>
                setVideoParams({ requestedResolution: v || undefined })
              }
              placeholder="例如：4K / 1920×1080"
              rows={1}
            />
          </div>
        ),
      },
      {
        title: '画面',
        content: (
          <div className="space-y-4">
            <TextField label="主体" value={videoParams.subject} onChange={(v) => setVideoParams({ subject: v })} placeholder="人物 / 物体的外观、服装、状态" />
            <TextField label="环境" value={videoParams.environment} onChange={(v) => setVideoParams({ environment: v })} placeholder="地点、背景、道具细节" />
            <TextField label="光线" value={videoParams.lighting} onChange={(v) => setVideoParams({ lighting: v })} placeholder="时间、光源、色调" />
            <TextField label="镜头" value={videoParams.cameraMovement} onChange={(v) => setVideoParams({ cameraMovement: v })} placeholder="机位、运动方式、手持或固定" />
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
            <TextField label="音频" value={videoParams.audio} onChange={(v) => setVideoParams({ audio: v })} placeholder="环境声、音乐、旁白；不需要就写无音乐" />
            <TextField label="负面提示词（留空时写实风格会自动补全）" value={videoParams.negativePrompt} onChange={(v) => setVideoParams({ negativePrompt: v })} placeholder="不想出现的东西，如：文字、水印、塑料质感" />
          </div>
        ),
      },
    ];
  } else if (scenario === 'image') {
    steps = [
      {
        title: '想法与规格',
        content: (
          <div className="space-y-4">
            <TextField label="你的想法（必填）" value={imageParams.idea} onChange={(v) => setImageParams({ idea: v })} placeholder="例如：大学校园香樟树下抓拍的女生，午后斑驳光影" rows={3} />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>画幅</label>
                <select className={inputCls} value={imageParams.aspectRatio} onChange={(e) => setImageParams({ aspectRatio: e.target.value as typeof imageParams.aspectRatio })}>
                  <option value="16:9">16:9 横屏</option>
                  <option value="9:16">9:16 竖屏</option>
                  <option value="1:1">1:1 方形</option>
                </select>
              </div>
              <div>
                <label className={labelCls}>风格</label>
                <select className={inputCls} value={imageParams.style} onChange={(e) => setImageParams({ style: e.target.value })}>
                  <option>写实</option>
                  <option>电影感</option>
                  <option>插画</option>
                </select>
              </div>
            </div>
          </div>
        ),
      },
      {
        title: '画面',
        content: (
          <div className="space-y-4">
            <TextField label="主体" value={imageParams.subject} onChange={(v) => setImageParams({ subject: v })} placeholder="人物 / 物体的外观、服装、表情、动作" />
            <TextField label="环境" value={imageParams.environment} onChange={(v) => setImageParams({ environment: v })} placeholder="地点、背景元素、前景陪衬" />
            <TextField label="光线" value={imageParams.lighting} onChange={(v) => setImageParams({ lighting: v })} placeholder="时间、光源方向、色温、氛围" />
          </div>
        ),
      },
      {
        title: '负面提示词',
        content: (
          <TextField label="负面提示词（留空时写实风格会自动补全）" value={imageParams.negativePrompt} onChange={(v) => setImageParams({ negativePrompt: v })} placeholder="不想出现的东西，如：文字、水印、塑料质感、过度磨皮" rows={3} />
        ),
      },
    ];
  } else if (scenario === 'document') {
    steps = [
      {
        title: '主题与类型',
        content: (
          <div className="space-y-4">
            <TextField label="要写什么（必填）" value={documentParams.idea} onChange={(v) => setDocumentParams({ idea: v })} placeholder="例如：我们咖啡店上半年的经营复盘，要找出利润下滑的原因" rows={3} />
            <div>
              <label className={labelCls}>文档类型</label>
              <select className={inputCls} value={documentParams.docType} onChange={(e) => setDocumentParams({ docType: e.target.value })}>
                <option>报告</option>
                <option>方案</option>
                <option>文章</option>
                <option>总结</option>
                <option>演讲稿</option>
              </select>
            </div>
          </div>
        ),
      },
      {
        title: '读者与语气',
        content: (
          <div className="space-y-4">
            <TextField label="目标读者" value={documentParams.audience} onChange={(v) => setDocumentParams({ audience: v })} placeholder="例如：公司管理层，不懂技术细节" />
            <TextField label="语气" value={documentParams.tone} onChange={(v) => setDocumentParams({ tone: v })} placeholder="例如：专业、清晰 / 亲切、口语化" />
            <TextField label="篇幅" value={documentParams.lengthHint} onChange={(v) => setDocumentParams({ lengthHint: v })} placeholder="例如：1500 字左右 / 一页 PPT 能讲完" />
          </div>
        ),
      },
      {
        title: '必须包含',
        content: (
          <TextField label="必须包含的内容" value={documentParams.mustInclude} onChange={(v) => setDocumentParams({ mustInclude: v })} placeholder="一条一行或用顿号分隔，如：上半年营收数据、下半年三条改进措施" rows={4} />
        ),
      },
    ];
  } else if (scenario === 'trip') {
    steps = [
      {
        title: '想法与目的地',
        content: (
          <div className="space-y-4">
            <TextField label="你的想法（必填）" value={tripParams.idea} onChange={(v) => setTripParams({ idea: v })} placeholder="例如：带爸妈去大理慢慢玩，不赶景点" rows={3} />
            <div className="grid grid-cols-2 gap-3">
              <TextField label="目的地" value={tripParams.destination} onChange={(v) => setTripParams({ destination: v })} placeholder="例如：云南大理" rows={1} />
              <div>
                <label className={labelCls}>天数</label>
                <input type="number" min={1} max={60} className={inputCls} value={tripParams.days} onChange={(e) => setTripParams({ days: Number(e.target.value) })} />
              </div>
            </div>
          </div>
        ),
      },
      {
        title: '同行与预算',
        content: (
          <div className="space-y-4">
            <TextField label="同行人员" value={tripParams.travelers} onChange={(v) => setTripParams({ travelers: v })} placeholder="例如：两人，父母 60 多岁，走路不能太多" />
            <TextField label="预算" value={tripParams.budgetHint} onChange={(v) => setTripParams({ budgetHint: v })} placeholder="例如：人均 5000 元以内，住宿可以适当好一点" />
          </div>
        ),
      },
      {
        title: '偏好与限制',
        content: (
          <div className="space-y-4">
            <TextField label="偏好" value={tripParams.interests} onChange={(v) => setTripParams({ interests: v })} placeholder="例如：当地菜市场、老街、湖边散步" />
            <TextField label="限制条件" value={tripParams.constraints} onChange={(v) => setTripParams({ constraints: v })} placeholder="例如：不爬山、每天回酒店午休、避开人挤人的网红店" />
          </div>
        ),
      },
    ];
  } else {
    steps = [
      {
        title: '你的想法',
        content: (
          <TextField label="你的想法（必填）" value={generalIdea} onChange={setGeneralIdea} placeholder="用大白话写下你想让 Muse 做什么" rows={5} />
        ),
      },
    ];
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-4">
        <h1 className="text-xl font-bold">{TITLES[scenario]}</h1>
        <StepForm
          steps={steps}
          current={Math.min(step, steps.length - 1)}
          onStepChange={setStep}
          canNext={step > 0 || ideaFilled}
          nextHint={step === 0 ? '先写下你的想法' : undefined}
        />
        {completion && (
          <SmartComplete
            scenario={scenario}
            getFields={completion.getFields}
            apply={completion.apply}
          />
        )}
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
