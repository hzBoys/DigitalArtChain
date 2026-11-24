import type { RegistrationUiState } from '@/src/models/ProofRecord'

const steps = [
  { title: 'Buat fingerprint', states: ['IDLE', 'HASHING', 'PRE_CHECKING', 'DUPLICATE_DETECTED', 'READY_TO_SIGN'] },
  { title: 'Tanda tangani', states: ['UPLOADING_PREVIEW', 'AWAITING_SIGNATURE', 'AWAITING_TX_APPROVAL'] },
  { title: 'Simpan bukti', states: ['MINING', 'SUCCESS'] },
] as const

export function StepStatus({ state }: { state: RegistrationUiState }) {
  const currentIndex = state === 'ERROR'
    ? 0
    : Math.max(0, steps.findIndex((step) => (step.states as readonly string[]).includes(state)))

  return (
    <ol className="workflow-stepper" aria-label="Tahapan pencatatan karya">
      {steps.map((step, index) => {
        const complete = state === 'SUCCESS' || index < currentIndex
        const active = index === currentIndex && state !== 'SUCCESS'
        return (
          <li className={`workflow-step${complete ? ' is-complete' : ''}${active ? ' is-active' : ''}`} key={step.title} aria-current={active ? 'step' : undefined}>
            <span className="workflow-step-number">{complete ? '✓' : `0${index + 1}`}</span>
            <span>{step.title}</span>
          </li>
        )
      })}
    </ol>
  )
}
