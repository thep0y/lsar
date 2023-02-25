interface Format {
	readonly flv: boolean;
	readonly m3u8: boolean;
}

type Prefix = string

export const DOUYU_PREFIXS: Record<Prefix, Format> = {
  'hw-tct': { flv: true, m3u8: true },
  'tc-tct1': { flv: true, m3u8: true },
  'hdltc1': { flv: true, m3u8: true },
  'dyp2p-hw': { flv: false, m3u8: true },
  'hls3a-akm': { flv: false, m3u8: true },
  'hls3-akm': { flv: false, m3u8: true },
  'hlsa-akm': { flv: false, m3u8: true },
  'akm-tct': { flv: false, m3u8: true }
}

export const DOUYU_PROXY = 'https://epg.112114.xyz/douyu/'