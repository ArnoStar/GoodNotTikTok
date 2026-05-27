import { useNavigate } from 'react-router-dom'

import type { UserProfile } from '../../types/profile'

import {
  avatar,
  btn,
  modalBox,
  modalStyle,
  userRow
} from '../../styles/profileStyles'

type Props = {
  title: string
  users: UserProfile[]
  buttonText: string
  onAction: (id: number) => void
  onClose: () => void
}

export default function FollowListModal({
  title,
  users,
  buttonText,
  onAction,
  onClose
}: Props) {
  const navigate = useNavigate()

  return (
    <div style={modalStyle}>
      <div style={modalBox}>
        <h2>{title}</h2>

        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: 10
          }}
        >
          {users.map(user => (
            <div
              key={user.id}
              style={{
                ...userRow,
                cursor: 'pointer'
              }}
              onClick={() =>
                navigate(`/profile/${user.id}`)
              }
            >
              <div
                style={{
                  ...avatar,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: '#1b1f24',
                  fontSize: 20
                }}
              >
                {user.img ? (
                  <img
                    src={`/stream/${user.img}`}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '50%'
                    }}
                  />
                ) : (
                  '👤'
                )}
              </div>

              <span
                style={{
                  flex: 1,
                  minWidth: 0,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap'
                }}
              >
                {user.email}
              </span>

              <button
                onClick={() => onAction(user.id)}
                style={btn}
              >
                {buttonText}
              </button>
            </div>
          ))}
        </div>

        <button onClick={onClose}>
          Закрыть
        </button>
      </div>
    </div>
  )
}