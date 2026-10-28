import type { MediaView } from '../types'
import { DemoEmbed } from './DemoEmbed'
import { DemoImage } from './DemoImage'
import { DemoVideo } from './DemoVideo'

export function MediaItem({ media }: { media: MediaView }) {
  if (media.provider !== 'local') {
    return <DemoEmbed provider={media.provider} videoId={media.src} caption={media.caption} />
  }
  if (media.type === 'image') {
    return <DemoImage src={media.src} alt={media.alt ?? media.caption} caption={media.caption} />
  }
  return <DemoVideo src={media.src} caption={media.caption} />
}
