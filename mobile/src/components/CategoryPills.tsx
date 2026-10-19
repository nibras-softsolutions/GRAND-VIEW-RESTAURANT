import React from 'react';
import {
  ScrollView,
  TouchableOpacity,
  Text,
  StyleSheet,
  View,
} from 'react-native';
import { Colors } from '../theme/colors';
import { Category } from '../types';

interface CategoryPillsProps {
  categories: Category[];
  selectedCategoryId: string;
  onSelectCategory: (id: string) => void;
  showAllOption?: boolean;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  selectedCategoryId,
  onSelectCategory,
  showAllOption = true,
}) => {
  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {showAllOption && (
          <TouchableOpacity
            style={[
              styles.pill,
              selectedCategoryId === 'all' && styles.pillActive,
            ]}
            onPress={() => onSelectCategory('all')}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.pillText,
                selectedCategoryId === 'all' && styles.pillTextActive,
              ]}
            >
              All Items
            </Text>
          </TouchableOpacity>
        )}

        {categories.map((cat) => {
          const isSelected = selectedCategoryId === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.pill, isSelected && styles.pillActive]}
              onPress={() => onSelectCategory(cat.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[styles.pillText, isSelected && styles.pillTextActive]}
              >
                {cat.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: 8,
  },
  scrollContent: {
    paddingHorizontal: 16,
    gap: 8,
    flexDirection: 'row',
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 2,
    elevation: 1,
  },
  pillActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primaryDark,
  },
  pillText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    letterSpacing: 0.2,
  },
  pillTextActive: {
    color: Colors.white,
    fontWeight: '700',
  },
});
