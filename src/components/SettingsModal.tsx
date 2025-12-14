interface SettingsModalProps {
  open: boolean
  pageSize: number
  onClose: () => void
  onSave: (pageSize: number) => void
}

export default function SettingsModal({ open, pageSize, onClose, onSave }: SettingsModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white w-full max-w-md rounded-lg shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">设置</h3>

        <div className="space-y-4">
          <label className="block">
            <span className="text-sm text-gray-700">每页卡片数量</span>
            <input
              type="number"
              min={10}
              max={500}
              defaultValue={pageSize}
              className="mt-1 w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              onChange={(e) => onSave(Number(e.target.value) || 100)}
            />
            <span className="text-xs text-gray-500">默认 100，建议 50-200 之间</span>
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200">关闭</button>
        </div>
      </div>
    </div>
  )
}
