import { NativeTabs } from "expo-router/unstable-native-tabs"
import { WorkoutNavigationGuard } from "@/features/do-workout/ui/WorkoutNavigationGuard"
import { useResolvedColorToken } from "@/shared/hooks/useResolvedColorToken"
import { semanticColorTokens } from "@/shared/lib/designTokens"

const PROTEIN_TAB_ENABLED = true

export default function TabLayout() {
  const tintColor = useResolvedColorToken(semanticColorTokens.accent)

  return (
    <>
      <WorkoutNavigationGuard />
      <NativeTabs tintColor={tintColor}>
        <NativeTabs.Trigger name="index">
          <NativeTabs.Trigger.Icon sf="book.fill" md="menu_book" />
          <NativeTabs.Trigger.Label>일지</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger name="tempo">
          <NativeTabs.Trigger.Icon sf="timer" md="timer" />
          <NativeTabs.Trigger.Label>템포</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
        <NativeTabs.Trigger
          name="protein"
          hidden={!PROTEIN_TAB_ENABLED}
        >
          <NativeTabs.Trigger.Icon sf="waterbottle.fill" md="water_bottle" />
          <NativeTabs.Trigger.Label>프로틴</NativeTabs.Trigger.Label>
        </NativeTabs.Trigger>
      </NativeTabs>
    </>
  )
}
