'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function UserManualPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('content');

  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/signin');
      return;
    }
    
    if (session.user.role !== 'admin') {
      router.push('/users/dashboard');
      return;
    }

    setLoading(false);
  }, [session, status, router]);

  if (status === 'loading' || loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!session || session.user.role !== 'admin') {
    return null;
  }

  const tabs = [
    { id: 'content', label: 'Content Management' },
    { id: 'badge', label: 'Badge Management' },
    { id: 'quest', label: 'Quest Management' },
    { id: 'quiz', label: 'Quiz Management' },
    { id: 'user', label: 'User Management' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-2xl font-bold">?</span>
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin User Manual</h1>
              <p className="text-gray-600 text-sm">Complete guide for managing the platform</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 border-b border-gray-200 overflow-x-auto">
            {tabs.map((tab) => {
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-6 py-3 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          {activeTab === 'content' && <ContentManagementContent />}
          {activeTab === 'badge' && <BadgeManagementContent />}
          {activeTab === 'quest' && <QuestManagementContent />}
          {activeTab === 'quiz' && <QuizManagementContent />}
          {activeTab === 'user' && <UserManagementContent />}
        </div>
      </div>
    </div>
  );
}

function ContentManagementContent() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Content Management System</h2>
        <p className="text-gray-600">Manages the learning platform's three-tier structure: Modules → Lessons → Tips</p>
      </div>

      <Section title="Core Functions">
        <FunctionCard
          number="1"
          title="Create Module"
          steps={[
            'Click "Add Module"',
            'Enter title and upload image',
            'Module appears in grid',
            'Badge button disabled until lessons added'
          ]}
        />
        <FunctionCard
          number="2"
          title="Manage Lessons"
          steps={[
            'Click "Manage Module" on any module card',
            'Click "Manage Lessons" in modal',
            'Add/edit/delete lessons',
            'Each lesson needs title, description, and tips'
          ]}
        />
        <FunctionCard
          number="3"
          title="Add Tips to Lessons"
          steps={[
            'Click "Add Tip" in lesson form',
            'Enter tip title and description',
            'Upload optional image',
            'Add multiple tips (minimum 1 required)',
            'Tips display as numbered carousel slides'
          ]}
        />
        <FunctionCard
          number="4"
          title="Create Badges"
          steps={[
            'Click badge status button on module/lesson card',
            'Module badge: Auto-fills Epic rarity, 50 XP',
            'Lesson badge: Auto-calculates from tip count (1-3 tips → Common 10 XP, 4+ tips → Rare 25 XP)',
            'Upload badge image and save'
          ]}
        />
      </Section>

      <Section title="Badge Status Indicators">
        <StatusTable>
          <StatusRow status="Badge Created" color="Green" meaning="Badge exists - click to edit" />
          <StatusRow status="Create Badge" color="Orange" meaning="Ready to create badge" />
          <StatusRow status="Add lessons first" color="Gray" meaning="Module has no lessons (disabled)" />
        </StatusTable>
      </Section>

      <Section title="Content Structure">
        <div className="bg-gray-50 rounded-lg p-6 font-mono text-sm">
          <div className="space-y-1 text-gray-700">
            <div>Module (Category)</div>
            <div className="ml-4">├── Lesson 1</div>
            <div className="ml-8">│   ├── Tip 1 (carousel slide)</div>
            <div className="ml-8">│   ├── Tip 2</div>
            <div className="ml-8">│   └── Tip 3</div>
            <div className="ml-4">├── Lesson 2</div>
            <div className="ml-8">│   └── Tips...</div>
            <div className="ml-4">└── Badge (Epic, 50 XP)</div>
            <div className="ml-8">└── Lesson Badges (Common/Rare, 10-25 XP)</div>
          </div>
        </div>
      </Section>

      <Section title="Auto-Calculation Rules">
        <InfoBox type="module">
          <strong>Module Badges:</strong> Fixed Epic rarity (50 XP). Only available after adding lessons. Category = Module title.
        </InfoBox>
        <InfoBox type="lesson">
          <strong>Lesson Badges:</strong> Auto-calculated from tip count. 1-3 tips → Common (10 XP), 4+ tips → Rare (25 XP). Category = "Lesson Completion".
        </InfoBox>
      </Section>
    </div>
  );
}

function BadgeManagementContent() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Badge Management System</h2>
        <p className="text-gray-600">Creates and manages achievement badges that reward users for completing modules, lessons, and quizzes</p>
      </div>

      <Section title="Core Functions">
        <FunctionCard
          number="1"
          title="Create Badges"
          steps={[
            'Click "Create Badge" button',
            'Fill in name, description, category',
            'Upload badge image',
            'Select trigger type (what awards the badge)',
            'Choose content (module, lesson, or quiz)',
            'System auto-calculates rarity and XP for most badges',
            'Click "Create Badge" to save'
          ]}
        />
        <FunctionCard
          number="2"
          title="Edit Badges"
          steps={[
            'Click yellow edit icon on any badge card',
            'Modify any field',
            'Upload new image if desired',
            'Click "Update Badge" to save changes'
          ]}
        />
        <FunctionCard
          number="3"
          title="Clean Up Orphaned Badges"
          steps={[
            'System detects badges linked to deleted content',
            'Red alert banner shows orphaned count',
            'Click "Re-check" to verify',
            'Click "Clean Up" to delete all orphaned badges'
          ]}
        />
      </Section>

      <Section title="Badge Trigger Types">
        <TriggerTable>
          <TriggerRow
            type="Module Complete"
            awarded="User completes all lessons in a module"
            rarity="Epic (50 XP)"
            example="Crime Prevention Master"
          />
          <TriggerRow
            type="Lesson Complete"
            awarded="User finishes a specific lesson"
            rarity="Common (10 XP) or Rare (25 XP) based on tip count"
            example="Anti-Theft Reader"
          />
          <TriggerRow
            type="Quiz Mastery"
            awarded="User scores 90%+ on a quiz"
            rarity="Epic (50 XP)"
            example="Cybersecurity Expert"
          />
          <TriggerRow
            type="Category Mastery"
            awarded="User scores 90%+ on ALL quizzes in a category"
            rarity="Legendary (100 XP)"
            example="Network Master"
          />
          <TriggerRow
            type="Manual Award"
            awarded="Admin manually grants to a user"
            rarity="Custom (you choose)"
            example="Special event badges"
          />
        </TriggerTable>
      </Section>

      <Section title="Rarity System">
        <RarityTable>
          <RarityRow rarity="Common" xp="10 XP" color="Gray" usage="1-3 tip lessons, manual badges" />
          <RarityRow rarity="Rare" xp="25 XP" color="Blue" usage="4+ tip lessons, manual badges" />
          <RarityRow rarity="Epic" xp="50 XP" color="Purple" usage="Module completion, quiz mastery" />
          <RarityRow rarity="Legendary" xp="100 XP" color="Yellow" usage="Category mastery" />
        </RarityTable>
      </Section>
    </div>
  );
}

function QuestManagementContent() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quest Management System</h2>
        <p className="text-gray-600">Centralized interface for managing daily learning quests</p>
      </div>

      <Section title="Weekly Quest Structure">
        <QuestTable>
          <QuestRow day="Monday" title="Suspect Line-Up" type="Line-Up" color="Blue" />
          <QuestRow day="Tuesday" title="Safety True or False" type="True/False" color="Green" />
          <QuestRow day="Wednesday" title="Code the Call" type="Puzzle" color="Purple" />
          <QuestRow day="Thursday" title="Inspection Game" type="Inspection" color="Orange" />
          <QuestRow day="Friday" title="Guess the Rank" type="Matching" color="Pink" />
        </QuestTable>
        <InfoBox type="note">
          Each quest has a fixed day assignment (cannot be changed), predefined title and game type, unique color coding, and custom thumbnail icon.
        </InfoBox>
      </Section>

      <Section title="Quest Types Explained">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <QuestTypeCard
            title="Line-Up (Monday)"
            concept="Suspect identification game"
            mechanic="Match or identify items in a lineup"
          />
          <QuestTypeCard
            title="True/False (Tuesday)"
            concept="Safety knowledge verification"
            mechanic="Binary choice questions"
          />
          <QuestTypeCard
            title="Puzzle (Wednesday)"
            concept="Emergency code challenges"
            mechanic="Problem-solving activities"
          />
          <QuestTypeCard
            title="Inspection (Thursday)"
            concept="Detail observation game"
            mechanic="Find items or spot differences"
          />
          <QuestTypeCard
            title="Matching (Friday)"
            concept="Rank identification"
            mechanic="Match items to categories"
          />
        </div>
      </Section>

      <Section title="How to Use">
        <FunctionCard
          number="1"
          title="Accessing Quest Details"
          steps={[
            'Method 1: Click anywhere on the quest card',
            'Method 2: Click any day in the timeline bar',
            'Method 3: Click "Manage Quest" button on card',
            'All methods navigate to quest detail page'
          ]}
        />
      </Section>
    </div>
  );
}

function QuizManagementContent() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Quiz Management System</h2>
        <p className="text-gray-600">Manages quizzes organized in categories with integrated badge creation</p>
      </div>

      <Section title="Core Functions">
        <FunctionCard
          number="1"
          title="Create Category"
          steps={[
            'Click "New Category"',
            'Enter category name (e.g., "Cybersecurity Fundamentals")',
            'Categories organize related quizzes',
            'No questions - just a container'
          ]}
        />
        <FunctionCard
          number="2"
          title="Create Quiz"
          steps={[
            'Click "New Quiz"',
            'Select category (optional)',
            'Enter title and timer',
            'Add questions (minimum 1 required)',
            'Each question needs: question text, lesson name, 4 options (A-D), correct answer, optional image/explanation'
          ]}
        />
        <FunctionCard
          number="3"
          title="Create Badges"
          steps={[
            'Quiz Mastery Badge (Epic, 50 XP): Click "Create Mastery Badge", auto-fills name "[Quiz] Expert", awarded at 90%+ score',
            'Category Master Badge (Legendary, 100 XP): Click "Create Master Badge", requires at least 1 sub-quiz, awarded when ALL sub-quizzes are mastered (90%+)'
          ]}
        />
      </Section>

      <Section title="Quiz Structure">
        <div className="bg-gray-50 rounded-lg p-6 font-mono text-sm">
          <div className="space-y-1 text-gray-700">
            <div>Category (Parent Quiz)</div>
            <div className="ml-4">├── Quiz 1</div>
            <div className="ml-8">│   ├── Question 1</div>
            <div className="ml-8">│   ├── Question 2</div>
            <div className="ml-8">│   └── Question 3</div>
            <div className="ml-4">├── Quiz 2</div>
            <div className="ml-8">│   └── Questions...</div>
            <div className="ml-4">└── Master Badge (Legendary, 100 XP)</div>
            <div className="ml-8">└── Quiz Badges (Epic, 50 XP each)</div>
          </div>
        </div>
      </Section>

      <Section title="Badge Types">
        <BadgeTypeTable>
          <BadgeTypeRow
            type="Quiz Mastery"
            trigger="Single quiz"
            rarity="Epic"
            xp="50"
            requirement="Score 90%+ on quiz"
          />
          <BadgeTypeRow
            type="Category Master"
            trigger="All category quizzes"
            rarity="Legendary"
            xp="100"
            requirement="Score 90%+ on ALL sub-quizzes"
          />
        </BadgeTypeTable>
      </Section>

      <Section title="Question Fields">
        <FieldTable>
          <FieldRow field="Question Text" required={true} purpose="The actual question" />
          <FieldRow field="Lesson" required={true} purpose="Topic/category label" />
          <FieldRow field="Options A-D" required={true} purpose="4 answer choices" />
          <FieldRow field="Correct Answer" required={true} purpose="Radio button selection" />
          <FieldRow field="Image" required={false} purpose="Visual aid" />
          <FieldRow field="Explanation" required={false} purpose="Why answer is correct" />
        </FieldTable>
      </Section>
    </div>
  );
}

function UserManagementContent() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">User Management System</h2>
        <p className="text-gray-600">Admin-only interface for viewing, editing, and managing all platform users</p>
      </div>

      <Section title="Core Functions">
        <FunctionCard
          number="1"
          title="View Users"
          steps={[
            'See all registered users in table format',
            'Displays: profile, email, role, status, join date',
            'Auto-loads on page access',
            'Click "Refresh" to reload data'
          ]}
        />
        <FunctionCard
          number="2"
          title="Search & Filter"
          steps={[
            'Search: By name, email, or user ID',
            'Role Filter: All / Admin / User',
            'Status Filter: All / Active / Inactive',
            'Clear Filters: Reset all filters at once'
          ]}
        />
        <FunctionCard
          number="3"
          title="Edit User"
          steps={[
            'Click "Edit" button on any user row',
            'Modify role (User ↔ Admin)',
            'Change status (Active ↔ Inactive)',
            'Cannot edit name or email',
            'Cannot edit your own account via delete button'
          ]}
        />
        <FunctionCard
          number="4"
          title="Delete User"
          steps={[
            'Click "Delete" button on user row',
            'Confirmation dialog shows user details',
            'Permanently removes user',
            'Cannot delete your own account'
          ]}
        />
      </Section>

      <Section title="User Roles">
        <RoleTable>
          <RoleRow role="Admin" color="Purple" capabilities="Full platform access, can manage users" />
          <RoleRow role="User" color="Blue" capabilities="Standard learner access" />
        </RoleTable>
      </Section>

      <Section title="User Status">
        <StatusTable>
          <StatusRow status="Active" color="Green" meaning="Account enabled, can log in" />
          <StatusRow status="Inactive" color="Red" meaning="Account disabled, cannot log in" />
        </StatusTable>
      </Section>

      <Section title="Validation & Rules">
        <InfoBox type="access">
          <strong>Access Control:</strong> Only admins can access this page. Non-admins redirected to dashboard. Unauthenticated users redirected to sign-in.
        </InfoBox>
        <InfoBox type="protection">
          <strong>Self-Protection:</strong> Cannot delete your own account. "Your Account" label shown instead. Edit button still available for yourself.
        </InfoBox>
      </Section>
    </div>
  );
}

// Helper Components
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-900 border-b border-gray-200 pb-2">{title}</h3>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

function FunctionCard({ number, title, steps }: { number: string; title: string; steps: string[] }) {
  return (
    <div className="flex gap-4 bg-gray-50 rounded-lg p-4">
      <div className="flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
        {number}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
        <ul className="space-y-1">
          {steps.map((step, index) => (
            <li key={index} className="text-sm text-gray-600 flex items-start gap-2">
              <span className="text-blue-600 mt-1">•</span>
              <span>{step}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function StatusTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Status</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Color</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Meaning</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">{children}</tbody>
      </table>
    </div>
  );
}

function StatusRow({ status, color, meaning }: { status: string; color: string; meaning: string }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 text-sm font-medium text-gray-900">{status}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{color}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{meaning}</td>
    </tr>
  );
}

function InfoBox({ type, children }: { type: string; children: React.ReactNode }) {
  const colors = {
    module: 'bg-blue-50 border-blue-200 text-blue-800',
    lesson: 'bg-blue-50 border-blue-200 text-blue-800',
    note: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    access: 'bg-red-50 border-red-200 text-red-800',
    protection: 'bg-green-50 border-green-200 text-green-800'
  };

  return (
    <div className={`p-4 rounded-lg border ${colors[type as keyof typeof colors] || colors.note}`}>
      <p className="text-sm leading-relaxed">{children}</p>
    </div>
  );
}

function TriggerTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Type</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Awarded When</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Rarity</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Example</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">{children}</tbody>
      </table>
    </div>
  );
}

function TriggerRow({ type, awarded, rarity, example }: { type: string; awarded: string; rarity: string; example: string }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 text-sm font-medium text-gray-900">{type}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{awarded}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{rarity}</td>
      <td className="px-4 py-3 text-sm text-gray-600 italic">{example}</td>
    </tr>
  );
}

function RarityTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Rarity</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">XP Value</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Color</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">When Used</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">{children}</tbody>
      </table>
    </div>
  );
}

function RarityRow({ rarity, xp, color, usage }: { rarity: string; xp: string; color: string; usage: string }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 text-sm font-medium text-gray-900">{rarity}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{xp}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{color}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{usage}</td>
    </tr>
  );
}

function QuestTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Day</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Quest Title</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Game Type</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Color Theme</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">{children}</tbody>
      </table>
    </div>
  );
}

function QuestRow({ day, title, type, color }: { day: string; title: string; type: string; color: string }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 text-sm font-medium text-gray-900">{day}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{title}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{type}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{color}</td>
    </tr>
  );
}

function QuestTypeCard({ title, concept, mechanic }: { title: string; concept: string; mechanic: string }) {
  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-4 border border-blue-200">
      <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
      <p className="text-sm text-gray-600 mb-1"><strong>Concept:</strong> {concept}</p>
      <p className="text-sm text-gray-600"><strong>Mechanic:</strong> {mechanic}</p>
    </div>
  );
}

function BadgeTypeTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Badge Type</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Trigger</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Rarity</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">XP</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Requirements</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">{children}</tbody>
      </table>
    </div>
  );
}

function BadgeTypeRow({ type, trigger, rarity, xp, requirement }: { type: string; trigger: string; rarity: string; xp: string; requirement: string }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 text-sm font-medium text-gray-900">{type}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{trigger}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{rarity}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{xp}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{requirement}</td>
    </tr>
  );
}

function FieldTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Field</th>
            <th className="px-4 py-3 text-center text-sm font-semibold text-gray-900">Required</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Purpose</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">{children}</tbody>
      </table>
    </div>
  );
}

function FieldRow({ field, required, purpose }: { field: string; required: boolean; purpose: string }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 text-sm font-medium text-gray-900">{field}</td>
      <td className="px-4 py-3 text-center">
        {required ? (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
            ✓
          </span>
        ) : (
          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            ✗
          </span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-gray-600">{purpose}</td>
    </tr>
  );
}

function RoleTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-200 rounded-lg">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Role</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Badge Color</th>
            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Capabilities</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">{children}</tbody>
      </table>
    </div>
  );
}

function RoleRow({ role, color, capabilities }: { role: string; color: string; capabilities: string }) {
  return (
    <tr className="hover:bg-gray-50">
      <td className="px-4 py-3 text-sm font-medium text-gray-900">{role}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{color}</td>
      <td className="px-4 py-3 text-sm text-gray-600">{capabilities}</td>
    </tr>
  );
}