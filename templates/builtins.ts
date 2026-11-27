import type { ScenarioId, VideoParams } from '@/lib/schemas';

export interface PromptTemplate {
  id: string;
  scenario: ScenarioId;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  /** Partial params applied over scenario defaults when the template is used. */
  videoParams?: Partial<VideoParams>;
  ideaZh?: string;
  ideaEn?: string;
}

export const BUILTIN_TEMPLATES: PromptTemplate[] = [
  {
    id: 'train-window-one-take',
    scenario: 'video',
    nameZh: '火车车窗一镜到底',
    nameEn: 'Train Window One-Take',
    descriptionZh: '固定在车窗边，出隧道后豁然开朗的电影感长镜头',
    descriptionEn: 'Fixed by a train window; cinematic reveal after exiting a tunnel',
    videoParams: {
      durationSeconds: 10,
      aspectRatio: '16:9',
      style: '电影感',
      cameraMovement: '镜头固定在火车右侧车窗边，第一人称视角，带轻微的手持呼吸感和列车振动',
      audio: '列车行驶的低频轰鸣，出隧道时风声渐强，远处一声鸟鸣',
    },
    ideaZh: '火车从黑暗隧道驶出，眼前豁然展开雪山与云海',
    ideaEn: 'A train bursts out of a dark tunnel into snow mountains above a sea of clouds',
  },
  {
    id: 'handheld-phone-pov',
    scenario: 'video',
    nameZh: '手机随手拍 POV',
    nameEn: 'Handheld Phone POV',
    descriptionZh: '第一人称跟拍，手机直出质感，真实手持晃动和自动曝光',
    descriptionEn: 'First-person follow shot with raw phone-footage look and natural shake',
    videoParams: {
      durationSeconds: 10,
      aspectRatio: '9:16',
      style: '写实',
      cameraMovement: '第一人称跟随视角，胸口高度手持，每一步有轻微上下浮动，对焦有呼吸感，不要推拉变焦',
      audio: '手机直录环境底噪，脚步声和远处车流声，无音乐无旁白',
    },
    ideaZh: '跟着一个人在城市街头自然地走一段路，像随手拍的生活片段',
    ideaEn: 'Follow someone walking naturally through city streets, like a candid phone clip',
  },
  {
    id: 'product-showcase',
    scenario: 'video',
    nameZh: '产品展示短片',
    nameEn: 'Product Showcase Clip',
    descriptionZh: '干净背景、柔光、缓慢环绕的产品特写',
    descriptionEn: 'Clean background, soft light, slow orbit around the product',
    videoParams: {
      durationSeconds: 10,
      aspectRatio: '16:9',
      style: '写实',
      cameraMovement: '缓慢环绕产品一周，最后推近到材质特写',
      lighting: '柔和的侧光，突出材质纹理，高光不过曝',
      audio: '轻微的环境底噪，无音乐',
    },
    ideaZh: '展示一件产品的外观、材质和使用细节',
    ideaEn: 'Showcase a product: its look, material, and usage details',
  },
];
