import { getCompetitionByInviteCode, getCompetitionSports, getDepartments } from '@/lib/queries/competition'
import JoinClient from '@/components/join/JoinClient'

export default async function JoinPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params

  const competition = await getCompetitionByInviteCode(code)

  if (!competition) {
    return (
      <div className="container" style={{ padding: '4rem 1.5rem', textAlign: 'center' }}>
        <div className="card" style={{ maxWidth: 500, margin: '0 auto', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>Mã mời không hợp lệ</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Không tìm thấy cuộc thi với mã "{code}". Vui lòng kiểm tra lại.
          </p>
          <a href="/" className="btn btn-primary">Về trang chủ</a>
        </div>
      </div>
    )
  }

  const [sports, departments] = await Promise.all([
    getCompetitionSports(competition.id),
    getDepartments(),
  ])

  return <JoinClient code={code} competition={competition} sports={sports} departments={departments} />
}
