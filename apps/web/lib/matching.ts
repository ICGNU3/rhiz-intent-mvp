import { supabase, Person, Goal, Suggestion } from './db';

export interface MatchScore {
  score: number;
  factors: {
    recency: number;
    frequency: number;
    affiliation: number;
    mutualInterests: number;
    goalAlignment: number;
  };
  confidence: number;
}

export interface MatchExplanation {
  reasons: string[];
  mutualInterests: string[];
  context: string;
}

export class Matching {
  async findPeople(query: string, userId: string, workspaceId: string): Promise<Person[]> {
    const { data, error } = await supabase
      .from('person')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('owner_id', userId)
      .ilike('full_name', `%${query}%`)
      .limit(10);

    if (error) {
      console.error('Error finding people:', error);
      return [];
    }

    return data || [];
  }

  async findPeopleByGoal(goalKind: string, userId: string, workspaceId: string): Promise<Person[]> {
    // Find people who might be relevant to the goal
    const { data, error } = await supabase
      .from('person')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('owner_id', userId)
      .limit(10);

    if (error) {
      console.error('Error finding people by goal:', error);
      return [];
    }

    // In a real implementation, you'd filter by relevance to the goal
    // For now, return all people
    return data || [];
  }

  async generateSuggestions(
    personAId: string,
    personBId: string,
    goalId: string | null,
    userId: string,
    workspaceId: string
  ): Promise<Suggestion[]> {
    // Calculate match score
    const score = await this.calculateMatchScore(personAId, personBId, goalId);
    
    // Generate explanation
    const explanation = await this.generateExplanation(personAId, personBId, goalId);
    
    // Create suggestion
    const suggestion: Omit<Suggestion, 'id' | 'created_at'> = {
      workspace_id: workspaceId,
      owner_id: userId,
      kind: 'introduction',
      a_id: personAId,
      b_id: personBId,
      goal_id: goalId,
      score: score.score,
      why: explanation,
      draft: null,
      state: 'proposed'
    };

    const { data, error } = await supabase
      .from('suggestion')
      .insert(suggestion)
      .select()
      .single();

    if (error) {
      console.error('Error creating suggestion:', error);
      return [];
    }

    return data ? [data] : [];
  }

  async calculateMatchScore(
    personAId: string,
    personBId: string,
    goalId: string | null
  ): Promise<MatchScore> {
    // In a real implementation, this would analyze:
    // - Recent encounters between the people
    // - Mutual connections
    // - Goal alignment
    // - Industry/role compatibility
    
    // For now, return a mock score
    const baseScore = Math.floor(Math.random() * 40) + 60; // 60-100
    
    return {
      score: baseScore,
      factors: {
        recency: Math.floor(Math.random() * 100),
        frequency: Math.floor(Math.random() * 100),
        affiliation: Math.floor(Math.random() * 100),
        mutualInterests: Math.floor(Math.random() * 100),
        goalAlignment: goalId ? Math.floor(Math.random() * 100) : 0
      },
      confidence: Math.floor(Math.random() * 30) + 70 // 70-100
    };
  }

  async generateExplanation(
    personAId: string,
    personBId: string,
    goalId: string | null
  ): Promise<MatchExplanation> {
    // In a real implementation, this would analyze the relationship
    // and generate a meaningful explanation
    
    const reasons = [
      'Both work in similar industries',
      'Complementary skill sets',
      'Shared professional interests',
      'Mutual connections in network'
    ];

    const mutualInterests = [
      'Technology',
      'Startups',
      'Networking'
    ];

    return {
      reasons: reasons.slice(0, Math.floor(Math.random() * reasons.length) + 1),
      mutualInterests: mutualInterests.slice(0, Math.floor(Math.random() * mutualInterests.length) + 1),
      context: 'Based on network analysis and professional alignment'
    };
  }

  async getTopSuggestions(userId: string, workspaceId: string, limit: number = 5): Promise<Suggestion[]> {
    const { data, error } = await supabase
      .from('suggestion')
      .select(`
        *,
        person_a:person!suggestion_a_id_fkey(full_name, primary_email),
        person_b:person!suggestion_b_id_fkey(full_name, primary_email)
      `)
      .eq('workspace_id', workspaceId)
      .eq('owner_id', userId)
      .eq('state', 'proposed')
      .order('score', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error getting top suggestions:', error);
      return [];
    }

    return data || [];
  }

  async acceptSuggestion(suggestionId: string): Promise<boolean> {
    const { error } = await supabase
      .from('suggestion')
      .update({ state: 'accepted' })
      .eq('id', suggestionId);

    if (error) {
      console.error('Error accepting suggestion:', error);
      return false;
    }

    return true;
  }
}
