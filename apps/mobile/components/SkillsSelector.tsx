import React, { useState } from 'react';
import { View, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Modal, Portal, Text, Chip, Button, Searchbar } from 'react-native-paper';
import { CATEGORIES } from '@marketplace/shared';

interface SkillsSelectorProps {
  visible: boolean;
  selectedSkills: number[]; // Array of skill IDs
  onDismiss: () => void;
  onSave: (skillIds: number[]) => void;
  allSkills: Array<{ id: number; key: string; name: string; category: string }>;
}

export function SkillsSelector({ visible, selectedSkills, onDismiss, onSave, allSkills }: SkillsSelectorProps) {
  const [localSelected, setLocalSelected] = useState<number[]>(selectedSkills);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Reset state when modal opens
  React.useEffect(() => {
    if (visible) {
      setLocalSelected(selectedSkills);
      setSelectedCategory(null);
      setSearchQuery('');
    }
  }, [visible, selectedSkills]);

  // Group skills by category
  const skillsByCategory: Record<string, typeof allSkills> = {};
  allSkills.forEach(skill => {
    if (!skillsByCategory[skill.category]) {
      skillsByCategory[skill.category] = [];
    }
    skillsByCategory[skill.category].push(skill);
  });

  // Filter skills based on search
  const filteredSkills = searchQuery
    ? allSkills.filter(skill => 
        skill.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        skill.key.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  const toggleSkill = (skillId: number) => {
    if (localSelected.includes(skillId)) {
      setLocalSelected(localSelected.filter(id => id !== skillId));
    } else {
      setLocalSelected([...localSelected, skillId]);
    }
  };

  const handleSave = () => {
    onSave(localSelected);
  };

  const handleCancel = () => {
    setLocalSelected(selectedSkills);
    onDismiss();
  };

  const getCategoryLabel = (categoryKey: string) => {
    const category = CATEGORIES.find(c => c.key === categoryKey);
    return category?.label || categoryKey;
  };

  const getCategoryIcon = (categoryKey: string) => {
    const category = CATEGORIES.find(c => c.key === categoryKey);
    return category?.icon || '📦';
  };

  return (
    <Portal>
      <Modal
        visible={visible}
        onDismiss={handleCancel}
        contentContainerStyle={styles.modal}
      >
        <View style={styles.header}>
          <Text variant="titleLarge" style={styles.title}>
            Select Your Skills
          </Text>
          <Text variant="bodyMedium" style={styles.subtitle}>
            {localSelected.length} skills selected
          </Text>
        </View>

        <Searchbar
          placeholder="Search skills..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
        />

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Show search results */}
          {filteredSkills ? (
            <View style={styles.section}>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                Search Results ({filteredSkills.length})
              </Text>
              <View style={styles.skillsGrid}>
                {filteredSkills.map(skill => (
                  <Chip
                    key={skill.id}
                    selected={localSelected.includes(skill.id)}
                    onPress={() => toggleSkill(skill.id)}
                    style={[
                      styles.skillChip,
                      localSelected.includes(skill.id) && styles.skillChipSelected
                    ]}
                    textStyle={localSelected.includes(skill.id) ? styles.skillChipTextSelected : undefined}
                    mode={localSelected.includes(skill.id) ? 'flat' : 'outlined'}
                  >
                    {skill.name}
                  </Chip>
                ))}
              </View>
            </View>
          ) : selectedCategory ? (
            /* Skills in selected category */
            <View style={styles.section}>
              <Button
                mode="text"
                onPress={() => setSelectedCategory(null)}
                icon="arrow-left"
                style={styles.backButton}
              >
                Back to Categories
              </Button>
              <Text variant="titleMedium" style={styles.sectionTitle}>
                {getCategoryIcon(selectedCategory)} {getCategoryLabel(selectedCategory)}
              </Text>
              <View style={styles.skillsGrid}>
                {(skillsByCategory[selectedCategory] || []).map(skill => (
                  <Chip
                    key={skill.id}
                    selected={localSelected.includes(skill.id)}
                    onPress={() => toggleSkill(skill.id)}
                    style={[
                      styles.skillChip,
                      localSelected.includes(skill.id) && styles.skillChipSelected
                    ]}
                    textStyle={localSelected.includes(skill.id) ? styles.skillChipTextSelected : undefined}
                    mode={localSelected.includes(skill.id) ? 'flat' : 'outlined'}
                  >
                    {skill.name}
                  </Chip>
                ))}
              </View>
            </View>
          ) : (
            /* Category Grid */
            <View style={styles.categoriesGrid}>
              {CATEGORIES.map(category => {
                const categorySkills = skillsByCategory[category.key] || [];
                const selectedInCategory = categorySkills.filter(s => localSelected.includes(s.id)).length;
                
                return (
                  <TouchableOpacity
                    key={category.key}
                    style={styles.categoryCard}
                    onPress={() => setSelectedCategory(category.key)}
                  >
                    <Text style={styles.categoryEmoji}>{category.icon}</Text>
                    <Text variant="labelLarge" style={styles.categoryName}>
                      {category.label}
                    </Text>
                    <Text style={styles.categoryCount}>
                      {categorySkills.length} skills
                    </Text>
                    {selectedInCategory > 0 && (
                      <View style={styles.categoryBadge}>
                        <Text style={styles.categoryBadgeText}>{selectedInCategory}</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <Button mode="outlined" onPress={handleCancel} style={styles.button}>
            Cancel
          </Button>
          <Button mode="contained" onPress={handleSave} style={styles.button}>
            Save ({localSelected.length})
          </Button>
        </View>
      </Modal>
    </Portal>
  );
}

const styles = StyleSheet.create({
  modal: {
    backgroundColor: '#ffffff',
    margin: 20,
    marginTop: 60,
    marginBottom: 60,
    borderRadius: 16,
    maxHeight: '80%',
    overflow: 'hidden',
  },
  header: {
    padding: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  title: {
    fontWeight: '600',
    color: '#1f2937',
  },
  subtitle: {
    color: '#6b7280',
    marginTop: 4,
  },
  searchBar: {
    marginHorizontal: 20,
    marginVertical: 12,
    elevation: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  section: {
    paddingBottom: 20,
  },
  sectionTitle: {
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingBottom: 20,
  },
  categoryCard: {
    width: '47%',
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    position: 'relative',
    minHeight: 110,
  },
  categoryEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  categoryName: {
    textAlign: 'center',
    color: '#1f2937',
    fontWeight: '600',
  },
  categoryCount: {
    fontSize: 11,
    color: '#9ca3af',
    marginTop: 2,
  },
  categoryBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#0ea5e9',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  categoryBadgeText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '600',
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  skillChip: {
    marginBottom: 4,
  },
  skillChipSelected: {
    backgroundColor: '#0ea5e9',
  },
  skillChipTextSelected: {
    color: '#ffffff',
  },
  footer: {
    flexDirection: 'row',
    gap: 12,
    padding: 20,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  button: {
    flex: 1,
  },
});
