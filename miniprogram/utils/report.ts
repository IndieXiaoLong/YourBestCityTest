// 12 维匹配报告生成器：根据用户维度值与城市维度值，生成每个维度约 200 字的匹配解读
import { DimKey, DIM_ORDER, DIMS } from '../data/dimensions'
import { City } from '../data/cities'
import { DimVector } from './match'

export interface DimReport {
  key: DimKey
  name: string
  icon: string
  color: string
  user: number
  city: number
  gap: number
  matchLevel: '高度契合' | '基本合拍' | '差异较大'
  text: string
}

type Level = 'high' | 'mid' | 'low'
const levelOf = (v: number): Level => (v >= 67 ? 'high' : v >= 34 ? 'mid' : 'low')

/** 城市侧描述（按维度 × 城市得分档位） */
const CITY_TEXT: Record<DimKey, Record<Level, string>> = {
  pace: {
    high: '{city}的节奏明快而高效，早晚高峰的人流、密集的机会与快速迭代的环境会推着你不断向前，适合喜欢充实感的人。',
    mid: '{city}的节奏张弛有度，既有都市的效率，也留出了喘息的空间，工作日忙碌、周末可以真正慢下来。',
    low: '{city}的生活节奏舒缓，街头巷尾透着不慌不忙的气质，日子可以过得从容而具体。',
  },
  social: {
    high: '{city}的社交能量充沛，夜宵局、社团活动、Livehouse 层出不穷，认识新朋友的机会随处可见。',
    mid: '{city}的社交氛围温和，熟人圈子稳定，偶尔也有新鲜活动，想热闹或想安静都能找到自己的位置。',
    low: '{city}的社交氛围相对内敛，人际关系简单清爽，适合享受独处、不喜应酬的生活方式。',
  },
  career: {
    high: '{city}的机会密度在国内数一数二，头部企业与新兴行业聚集，职业天花板很高，当然也伴随着更强的竞争。',
    mid: '{city}的产业稳步发展，有不错的就业与上升空间，努力能被看见，也不必把全部生活押在工作上。',
    low: '{city}的职场竞争温和，机会总量不大但生活压力也小，更适合求稳、或以生活为重心的阶段。',
  },
  trend: {
    high: '{city}是新潮事物的试验场，新品牌、新展览、新玩法总是先在这里落地，永远不缺新鲜感。',
    mid: '{city}对新鲜事物保持着刚刚好的热情，流行的东西都有，但还不至于让人应接不暇。',
    low: '{city}的气质偏传统稳重，新潮玩意儿不算多，却也因此保留了更多本真的生活味道。',
  },
  history: {
    high: '{city}的街巷里写满故事，古迹、老字号与市井记忆交织，随手一摸都是时光的质感。',
    mid: '{city}有自己的历史底色，老城区里藏着值得慢慢发现的古迹与人文痕迹。',
    low: '{city}是一座年轻的城市，历史痕迹不多，一切都崭新而面向未来。',
  },
  nature: {
    high: '{city}被山水与绿地环抱，公园、绿道与近郊徒步路线触手可及，城市与自然几乎无缝衔接。',
    mid: '{city}有像样的公园和绿地，周末想透透气、散散步并不困难。',
    low: '{city}的自然资源相对有限，绿色更多存在于街角的口袋公园，想亲近山野需要专程远行。',
  },
  waterfront: {
    high: '水是{city}的灵魂，江海岸线穿城而过，散步、夜跑、看日落，都有开阔的水面作伴。',
    mid: '{city}有湖泊或河段点缀其间，水景虽不是城市的主角，却也为日常添了几分灵气。',
    low: '{city}缺少大江大海，水景稀缺，城市气质更偏向内陆的厚重与干爽。',
  },
  climate: {
    high: '{city}气候温暖，冬天也少有严寒，轻装出门的日子占了大半年，怕冷的人会在这里松一口气。',
    mid: '{city}四季分明，春花秋叶、夏蝉冬雪各有滋味，需要为换季做好准备，也能收获完整的时间感。',
    low: '{city}的冬天寒冷而漫长，但室内暖气充足、雪景迷人，怕不怕冷全看你如何装备自己。',
  },
  food: {
    high: '{city}是公认的美食之城，从清晨的早点到深夜的大排档，街头巷尾的烟火气能把每一天都喂得熨帖。',
    mid: '{city}的饮食自成一派，本地特色鲜明，日常吃喝完全不用担心无聊。',
    low: '{city}的饮食相对家常，惊艳不多但胜在实在，口味挑剔的人需要自己多花些心思觅食。',
  },
  luxury: {
    high: '{city}的消费选择精致而丰富，高端商圈、独立咖啡馆与买手店密度很高，讲究品质的人会如鱼得水。',
    mid: '{city}的消费水准适中，品质与实惠可以兼顾，偶尔犒劳自己毫无压力。',
    low: '{city}的消费朴实接地气，精致选项不多，但物价友好、日子轻松。',
  },
  global: {
    high: '{city}的国际化程度很高，外籍社群、国际航线与多元文化触手可及，世界仿佛就在家门口。',
    mid: '{city}有一定的国际元素，外企与涉外场合不算少，视野可以保持在打开的状态。',
    low: '{city}的国际元素较少，生活圈更加本土化，适合安心扎根本地文化的人。',
  },
  stable: {
    high: '{city}的宜居度很高，生活成本可控、配套完善，是能把日子过安稳、把根扎下来的地方。',
    mid: '{city}在机会与生活成本之间取得了平衡，只要规划得当，安家落户并不算难。',
    low: '{city}的机会多但压力也大，房价与竞争都不轻松，更适合把它当作奋斗场而非养老地。',
  },
}

/** 用户侧描述（按用户得分档位，通用模板） */
const USER_TEXT: Record<Level, string> = {
  high: '测试结果显示，你在「{dim}」上有着鲜明的偏好（你的得分 {user} 分），这一维度会实实在在地影响你在一座城市的幸福感。',
  mid: '你的「{dim}」倾向为中等水平（你的得分 {user} 分），在这个维度上你比较随和，大多数环境都能适应。',
  low: '你的「{dim}」需求偏低（你的得分 {user} 分），这一维度基本不会左右你的城市选择。',
}

/** 差距点评（按 |用户-城市| 差距） */
function gapText(gap: number, dimName: string, cityName: string, user: number, city: number): string {
  if (gap <= 12) {
    return `你们在这一维度几乎同频：你的期待与${cityName}的气质严丝合缝，这会是你住下来之后最舒服、最不需要磨合的部分。`
  }
  if (gap <= 28) {
    return `这一维度你们基本合拍：${cityName}得分 ${city} 分，与你略有差距但彼此兼容，相处起来不会有明显的拧巴感。`
  }
  if (user > city) {
    return `需要留意：你比较看重「${dimName}」，而${cityName}在这一维度相对平淡（${city} 分），长期居住可能会感到某种缺失，建议先短期旅居体验，确认自己能否适应这种落差。`
  }
  return `需要留意：你对「${dimName}」需求不高，而${cityName}在这一维度相当突出（${city} 分），这部分城市气质对你来说可能有些「过盛」，但也可能带来意料之外的惊喜。`
}

/** 维度行动建议（通用，按维度给出落地建议） */
const ADVICE_TEXT: Record<DimKey, string> = {
  pace: '落地建议：先用两周记录自己在这座城市里的作息与通勤耗时，身体的疲惫感或松弛感，会比任何数据更诚实地告诉你答案。',
  social: '落地建议：入住后第一个月，主动参加两到三次本地社群活动或兴趣局，社交密度是否合你心意，很快就会有真实的体感。',
  career: '落地建议：不妨先翻一翻这座城市的招聘网站和行业报告，看看你所在赛道的岗位数量与薪资带宽，机会的多寡一目了然。',
  trend: '落地建议：找当地的生活方式榜单或同城活动小程序逛一逛，如果上面的展览、新店和玩法让你心动，这座城就不会让你无聊。',
  history: '落地建议：安排一次老城区的步行漫游，走一走老街、进一进本地博物馆，你与这座城市人文气场的缘分深浅，一趟便知。',
  nature: '落地建议：打开地图看看城市周边的绿道、公园和徒步路线密度，再挑一个周末实地走一次，身体的舒展程度不会骗人。',
  waterfront: '落地建议：傍晚时分去江边或海边坐一坐，看看跑步、垂钓、散步的人群，如果那一刻你觉得「就是这儿了」，答案已经浮现。',
  climate: '落地建议：查一查这座城市最冷月与最热月的均温，再对照你过往最难熬的季节记忆，气候这道题的答案其实藏在你的身体里。',
  food: '落地建议：照着本地人的推荐连吃三天——一顿早点、一顿正餐、一顿夜宵，你的胃会替你对这座城市投出最诚实的一票。',
  luxury: '落地建议：逛一次这座城市最具代表性的商圈，从橱窗到咖啡馆的价格带，会直观地告诉你这里的消费气质与你的钱包是否合拍。',
  global: '落地建议：留意机场航线数量、国际学校与外籍社群的活跃度，这些细节决定了一座城市的「世界接口」有多宽。',
  stable: '落地建议：认真算一笔账——房租或房贷、通勤、教育与医疗支出占收入的比例，数字会告诉你这座城能不能接住你想过的日子。',
}

/** 生成 12 维完整匹配报告 */
export function buildDimReports(vector: DimVector, city: City): DimReport[] {
  return DIM_ORDER.map(key => {
    const user = vector[key]
    const cityScore = city.scores[key]
    const gap = Math.abs(user - cityScore)
    const matchLevel: DimReport['matchLevel'] = gap <= 12 ? '高度契合' : gap <= 28 ? '基本合拍' : '差异较大'
    const dimName = DIMS[key].name
    const text =
      USER_TEXT[levelOf(user)].replace('{dim}', dimName).replace('{user}', String(user)) +
      CITY_TEXT[key][levelOf(cityScore)].replace(/\{city\}/g, city.name) +
      gapText(gap, dimName, city.name, user, cityScore) +
      ADVICE_TEXT[key]
    return {
      key,
      name: dimName,
      icon: DIMS[key].icon,
      color: DIMS[key].color,
      user,
      city: cityScore,
      gap,
      matchLevel,
      text,
    }
  })
}
