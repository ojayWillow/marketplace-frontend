import { View, ScrollView, Pressable, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import { router } from 'expo-router';
import { getCategoryIcon, getCategoryLabel } from '@marketplace/shared';
import { colors } from '../../../../src/theme';

interface ProfileSkillsProps {
  skills: string[];
  themeColors: typeof colors.light;
}

export function ProfileSkills({ skills, themeColors }: ProfileSkillsProps) {
  if (skills.length === 0) {
    return (
      <Pressable 
        onPress={() => router.push('/profile/edit')}
        style={[styles.addSkillsPrompt, { backgroundColor: themeColors.card }]}
      >
        <Text style={styles.addSkillsIcon}>🛠️</Text>
        <View style={styles.addSkillsText}>
          <Text style={[styles.addSkillsTitle, { color: themeColors.text }]}>Add your skills</Text>
          <Text style={[styles.addSkillsSubtitle, { color: themeColors.textSecondary }]}>
            Let others know what you can help with
          </Text>
        </View>
        <Text style={[styles.addSkillsArrow, { color: themeColors.textMuted }]}>›</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.skillsSection}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Skills</Text>
      </View>
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.skillsScrollContent}
      >
        {skills.map((skillKey: string, index: number) => (
          <View 
            key={index} 
            style={[styles.skillItem, { backgroundColor: themeColors.card }]}
          >
            <Text style={styles.skillIcon}>{getCategoryIcon(skillKey)}</Text>
            <Text style={[styles.skillLabel, { color: themeColors.text }]} numberOfLines={1}>
              {getCategoryLabel(skillKey)}
            </Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  skillsSection: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
  },
  skillsScrollContent: {
    paddingHorizontal: 20,
    gap: 12,
  },
  skillItem: {
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    minWidth: 80,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  skillIcon: {
    fontSize: 24,
    marginBottom: 6,
  },
  skillLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  addSkillsPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 24,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderStyle: 'dashed',
  },
  addSkillsIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  addSkillsText: {
    flex: 1,
  },
  addSkillsTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  addSkillsSubtitle: {
    fontSize: 13,
    marginTop: 2,
  },
  addSkillsArrow: {
    fontSize: 24,
  },
});
