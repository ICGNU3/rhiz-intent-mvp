import { IntentKind } from './types';

export interface IntroContext {
  personA: {
    name: string;
    title?: string;
    company?: string;
  };
  personB: {
    name: string;
    title?: string;
    company?: string;
  };
  goal?: {
    kind: IntentKind;
    title: string;
    details?: string;
  };
  mutualInterests?: string[];
  connectionStrength: number;
}

export function preIntroPing(context: IntroContext): string {
  const { personA, personB, goal, mutualInterests, connectionStrength } = context;
  
  let base = `Hey ${personA.name}, I think you'd really connect with ${personB.name}`;
  
  // Add context based on goal
  if (goal) {
    switch (goal.kind) {
      case 'raise_seed':
      case 'raise_series_a':
        base += `. ${personB.name} is ${personB.title || 'an investor'} who's been investing in early-stage startups for the past few years`;
        break;
      case 'hire_engineer':
      case 'hire_designer':
      case 'hire_sales':
        base += `. ${personB.name} has ${personB.title || 'relevant experience'} that could help with your hiring needs`;
        break;
      case 'find_mentor':
        base += `. ${personB.name} has been a founder and could provide valuable mentorship`;
        break;
      case 'get_customer':
        base += `. ${personB.name} might be interested in your product/service`;
        break;
      default:
        base += `. I think you two would have a great conversation`;
    }
  } else {
    base += `. I think you two would have a great conversation`;
  }
  
  // Add mutual interests if available
  if (mutualInterests && mutualInterests.length > 0) {
    base += ` given your shared interest in ${mutualInterests.slice(0, 2).join(' and ')}`;
  }
  
  base += `. Would you be open to an intro?`;
  
  return base;
}

export function doubleOptIntro(context: IntroContext): string {
  const { personA, personB, goal, mutualInterests } = context;
  
  let intro = `Hi ${personB.name}, I'd like to introduce you to ${personA.name}`;
  
  // Add person A context
  if (personA.title && personA.company) {
    intro += `, ${personA.title} at ${personA.company}`;
  } else if (personA.title) {
    intro += `, ${personA.title}`;
  } else if (personA.company) {
    intro += ` from ${personA.company}`;
  }
  
  // Add goal context
  if (goal) {
    intro += `. ${personA.name} is currently ${goal.title.toLowerCase()}`;
    if (goal.details) {
      intro += ` - ${goal.details}`;
    }
  }
  
  intro += `.\n\n`;
  
  // Add person B context
  intro += `${personA.name}, ${personB.name} is ${personB.title || 'someone I think you should know'}`;
  if (personB.company) {
    intro += ` at ${personB.company}`;
  }
  
  // Add mutual interests
  if (mutualInterests && mutualInterests.length > 0) {
    intro += `. You both share interests in ${mutualInterests.slice(0, 3).join(', ')}`;
  }
  
  // Add goal-specific context for person B
  if (goal) {
    switch (goal.kind) {
      case 'raise_seed':
      case 'raise_series_a':
        if (personB.title?.toLowerCase().includes('partner') || personB.title?.toLowerCase().includes('investor')) {
          intro += ` and has been investing in early-stage companies, particularly in the SaaS space`;
        }
        break;
      case 'hire_engineer':
        if (personB.title?.toLowerCase().includes('engineer') || personB.title?.toLowerCase().includes('developer')) {
          intro += ` and has deep engineering experience`;
        }
        break;
      case 'hire_designer':
        if (personB.title?.toLowerCase().includes('designer') || personB.title?.toLowerCase().includes('ux')) {
          intro += ` and has extensive design experience`;
        }
        break;
      case 'find_mentor':
        if (personB.title?.toLowerCase().includes('founder') || personB.title?.toLowerCase().includes('ceo')) {
          intro += ` and has been through the startup journey themselves`;
        }
        break;
    }
  }
  
  intro += `.\n\nWould you both be open to connecting?`;
  
  return intro;
}

export function followUpTemplate(context: IntroContext, daysSinceIntro: number): string {
  const { personA, personB } = context;
  
  if (daysSinceIntro <= 3) {
    return `Hi ${personA.name}, just checking in to see if you had a chance to connect with ${personB.name} yet. Let me know if you need anything!`;
  } else if (daysSinceIntro <= 7) {
    return `Hey ${personA.name}, hope the intro with ${personB.name} went well! Would love to hear how it went if you have a moment.`;
  } else {
    return `Hi ${personA.name}, it's been a bit since the intro with ${personB.name}. How did it go? Always happy to make more connections if needed!`;
  }
}

export function reconnectTemplate(context: IntroContext, lastContactDays: number): string {
  const { personA, personB } = context;
  
  if (lastContactDays <= 30) {
    return `Hey ${personA.name}, hope you're doing well! I was thinking about our recent conversation and wondered if you'd like to catch up sometime.`;
  } else if (lastContactDays <= 90) {
    return `Hi ${personA.name}, it's been a while! I hope everything is going great. Would love to reconnect and hear what you've been up to.`;
  } else {
    return `Hey ${personA.name}, long time no see! I hope you're doing well. Would love to catch up and hear about what you've been working on.`;
  }
}
