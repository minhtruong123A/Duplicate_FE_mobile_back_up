// src/components/FilterBar.tsx

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Svg, Path } from 'react-native-svg';

const FilterIcon = (props: any) => (
    <Svg width={16} height={16} viewBox="0 0 24 24" fill="none" {...props}>
        <Path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" stroke={props.color || "#333"} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
);

type FilterBarProps = {
    filters: string[];
    onSelectFilter: (filter: string) => void;
    activeFilter: string | null;
};

export default function FilterBar({ filters, onSelectFilter, activeFilter }: FilterBarProps) {
    return (
        <View style={styles.container}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.scrollContainer}>
                {filters.map((filter, index) => {
                    const isActive = activeFilter === filter;
                    return (
                        <TouchableOpacity
                            key={index}
                            style={[styles.filterButton, isActive && styles.activeFilterButton]}
                            onPress={() => onSelectFilter(filter)}
                        >
                            {filter === 'Filter' && <FilterIcon color={isActive ? '#fff' : '#333'} />}
                            <Text style={[styles.filterText, isActive && styles.activeFilterText]}>
                                {filter}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        // CẬP NHẬT: Tăng padding dọc để thanh filter cao hơn, dễ vuốt hơn
        paddingVertical: 16,
        paddingHorizontal: 8,
        backgroundColor: '#f0f2f5',
    },
    scrollContainer: {
        alignItems: 'center',
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        marginHorizontal: 4,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    activeFilterButton: {
        backgroundColor: '#d9534f',
        borderColor: '#d9534f',
    },
    filterText: {
        fontFamily: 'Oxanium-SemiBold',
        fontSize: 14,
        color: '#333',
        marginLeft: 4,
    },
    activeFilterText: {
        color: '#fff',
    },
});
