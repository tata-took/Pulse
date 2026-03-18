import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { TabRow } from './TabRow'
import { useUIStore } from '../../stores/uiStore'
import { db } from '../../db'
import type { Group, Tab } from '../../types'

interface GroupCardProps {
  group: Group
}

export function GroupCard({ group }: GroupCardProps) {
  const { groupOpenState, setGroupOpen } = useUIStore()
  const isOpen = groupOpenState[group.groupId] ?? true
  const [tabs, setTabs] = useState<Tab[]>([])

  useEffect(() => {
    const load = async () => {
      const groupTabs = await db.tabs
        .where('groupId')
        .equals(group.groupId)
        .filter((t) => !t.isArchived)
        .toArray()

      // Sort: pinned first, then by sortOrder
      groupTabs.sort((a, b) => {
        if (a.pinnedAt && !b.pinnedAt) return -1
        if (!a.pinnedAt && b.pinnedAt) return 1
        return b.sortOrder - a.sortOrder
      })

      setTabs(groupTabs)
    }
    load()
  }, [group.groupId])

  const toggle = () => setGroupOpen(group.groupId, !isOpen)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-3 overflow-hidden">
      {/* Group Header */}
      <button
        onClick={toggle}
        className="w-full flex items-center gap-3 px-4 py-3 tappable"
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-lg shrink-0"
          style={{ background: group.colorHex + '22' }}
        >
          {group.emoji}
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-[15px] font-semibold text-gray-800">{group.name}</p>
          <p className="text-[12px] text-gray-400">{tabs.length}件のタブ</p>
        </div>

        {group.hasUnread && (
          <div className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
        )}

        {isOpen ? (
          <ChevronDown size={18} className="text-gray-400 shrink-0" />
        ) : (
          <ChevronRight size={18} className="text-gray-400 shrink-0" />
        )}
      </button>

      {/* Tabs */}
      <AnimatePresence initial={false}>
        {isOpen && tabs.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 divide-y divide-gray-50 border-t border-gray-100">
              {tabs.map((tab) => (
                <TabRow key={tab.tabId} tab={tab} />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isOpen && tabs.length === 0 && (
        <div className="px-4 py-4 border-t border-gray-100 text-center">
          <p className="text-[13px] text-gray-400">まだタブがありません</p>
        </div>
      )}
    </div>
  )
}
