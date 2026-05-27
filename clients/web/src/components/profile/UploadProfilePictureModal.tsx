type Props = {
  selectedFile: File | null
  setSelectedFile: (file: File | null) => void
  onSubmit: () => void
  onClose: () => void
}

export default function UploadProfilePictureModal({
  setSelectedFile,
  onSubmit,
  onClose
}: Props) {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
      }}
    >
      <div
        style={{
          background: '#111',
          padding: 30,
          borderRadius: 16,
          minWidth: 320
        }}
      >
        <h2 style={{ marginTop: 0 }}>
          Change profile picture
        </h2>

        <input
          type="file"
          accept=".png,.jpg,.jpeg,image/png,image/jpeg"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (!file) return
            setSelectedFile(file)
          }}
        />

        <div
          style={{
            display: 'flex',
            gap: 10,
            marginTop: 20
          }}
        >
          <button
            onClick={onSubmit}
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              border: 'none',
              background: '#0f9d58',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Submit
          </button>

          <button
            onClick={onClose}
            style={{
              padding: '10px 16px',
              borderRadius: 10,
              border: 'none',
              background: '#333',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}