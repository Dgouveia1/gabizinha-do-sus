import Badge from '@/components/ui/Badge'

const semesterColors = [
  'mint', 'sky', 'pink', 'lavender', 'sand', 'mint',
  'sky', 'pink', 'lavender', 'sand', 'mint', 'sky',
]

export default function SemesterBadge({ semester }) {
  if (!semester) return null
  const color = semesterColors[(semester - 1) % semesterColors.length]
  return <Badge variant={color}>{semester}º Semestre</Badge>
}
