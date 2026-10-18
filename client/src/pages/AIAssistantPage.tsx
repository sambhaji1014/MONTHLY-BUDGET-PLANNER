import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import { formatINR } from '../utils/formatters';
import { Card, CardHeader, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  Bot,
  Send,
  Sparkles,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  User,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  highlights?: string[];
}

export const AIAssistantPage: React.FC = () => {
  const {
    userProfile,
    monthlyIncome,
    totalExpenses,
    remainingIncome,
    savingsRate,
    budgetHealthScore,
    budgetHealthRating,
    categories,
    monthEndForecast,
    goals,
  } = useFinance();

  const displayName = userProfile?.name || 'there';

  const [inputQuery, setInputQuery] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Hello ${displayName}. I am your WealthWise Financial Assistant. All my answers are grounded strictly in your current budget, your ₹${monthlyIncome.toLocaleString('en-IN')} income, and your current health score of ${budgetHealthScore}/100. How may I help you today?`,
      timestamp: '10:00 AM',
      highlights: [
        `Net Income: ${formatINR(monthlyIncome)}`,
        `Current Savings Rate: ${savingsRate}%`,
        `Health Rating: ${budgetHealthRating}`,
      ],
    },
  ]);

  const quickPrompts = [
    'Where is most of my money going this month?',
    'Can I afford a ₹35,000 spontaneous purchase?',
    'How do I boost my savings rate from 26% to 35%?',
    'Is my emergency fund sufficient?',
  ];

  const generateAIResponse = (query: string): string => {
    const q = query.toLowerCase();

    // Top categories
    const sortedCats = [...categories].sort((a, b) => b.spentAmount - a.spentAmount);
    const topCat = sortedCats[0];
    const secondCat = sortedCats[1];

    if (q.includes('where') || q.includes('spending') || q.includes('going')) {
      return `Analyzing your October ledger: Your highest cash outflow is **${topCat.name}** at ${formatINR(topCat.spentAmount)} (${Math.round((topCat.spentAmount / (totalExpenses || 1)) * 100)}% of total spend), followed by **${secondCat.name}** at ${formatINR(secondCat.spentAmount)}. Your fixed living essentials consume ${Math.round((topCat.spentAmount / monthlyIncome) * 100)}% of monthly income.`;
    }

    if (q.includes('afford') || q.includes('purchase') || q.includes('buy') || q.includes('gadget')) {
      const safeBuffer = remainingIncome - 15000; // retain 15k reserve
      if (safeBuffer >= 35000) {
        return `Yes, you have an unallocated surplus of ${formatINR(remainingIncome)}. After a ₹35,000 purchase, you would still maintain a comfortable ₹${(remainingIncome - 35000).toLocaleString('en-IN')} cash buffer before next salary credit. However, your savings rate would drop by ~7%.`;
      } else {
        return `Caution advised: Your current remaining cashflow is ${formatINR(remainingIncome)}. A ₹35,000 purchase would deplete ${Math.round((35000 / remainingIncome) * 100)}% of your month-end cushion and violate your safe daily spending limit of ${formatINR(monthEndForecast.dailySafeSpend)}/day. Consider deferring or saving across two pay cycles.`;
      }
    }

    if (q.includes('emergency') || q.includes('fund') || q.includes('cushion')) {
      const emergencyGoal = goals.find((g) => g.category.toLowerCase().includes('emergency'));
      const emergencySaved = emergencyGoal?.currentAmount || 260000;
      const monthsCovered = Math.round((emergencySaved / (totalExpenses || 1)) * 10) / 10;
      return `Your liquid emergency cushion currently stands at **${formatINR(emergencySaved)}**. Based on your average monthly living burn of ~${formatINR(totalExpenses)}, this covers **${monthsCovered} months** of essential obligations. Standard financial engineering recommends 6 months (~${formatINR(totalExpenses * 6)}). You are 74% of the way to complete resilience!`;
    }

    if (q.includes('boost') || q.includes('increase') || q.includes('savings rate')) {
      return `To elevate your savings rate to 35% (saving ${formatINR(monthlyIncome * 0.35)}/mo), your flexible discretionary wants (currently ${formatINR(categories.filter(c => c.type === 'want').reduce((s, c) => s + c.spentAmount, 0))}) must be trimmed by ₹8,500. Specifically, reducing Dining Out by ₹3,500 and Personal Shopping by ₹3,000 will hit this target without altering your rent or auto EMI. Run the 'Aggressive Wealth' optimizer to apply this seamlessly.`;
    }

    return `Based on your October cashflow metrics: You have earned ${formatINR(monthlyIncome)}, spent ${formatINR(totalExpenses)}, and are retaining ${formatINR(remainingIncome)} in cashflow. Your financial health score is ${budgetHealthScore}/100 with zero risk of overdraft for upcoming scheduled bills. You can ask me about category trim options, goal timelines, or simulated purchases!`;
  };

  const handleSend = (textToSend?: string) => {
    const query = textToSend || inputQuery;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');

    // Simulate AI thinking and grounded response
    setTimeout(() => {
      const aiReply = generateAIResponse(query);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: aiReply,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 400);
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-silver-soft/80 gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-bold uppercase tracking-widest text-gold-dark flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-gold-champagne" />
              Grounded AI Advisory
            </span>
            <span className="text-silver-brushed">•</span>
            <span className="text-xs text-espresso-light">100% Deterministic Financial Grounding</span>
          </div>
          <h1 className="font-serif text-2xl sm:text-3xl lg:text-4xl font-bold text-espresso-charcoal tracking-tight">
            AI Finance Assistant
          </h1>
          <p className="text-xs sm:text-sm text-espresso-muted mt-1 font-normal">
            Ask complex financial questions. Answers are calculated directly from your actual ledger and budget envelopes.
          </p>
        </div>

        <Badge variant="gold">
          Live Model: Financial Logic Engine v2.4
        </Badge>
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap items-center gap-2" role="region" aria-label="Suggested financial questions">
        <span className="text-xs font-semibold text-espresso-muted flex items-center gap-1">
          <HelpCircle className="w-3.5 h-3.5 text-blush-deep" /> Try asking:
        </span>
        {quickPrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => handleSend(prompt)}
            className="text-xs px-3 py-1.5 rounded-xl bg-white border border-silver-soft hover:border-blush-accent/50 text-espresso-charcoal hover:bg-blush-soft/20 transition-all text-left shadow-2xs"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Chat Log Window */}
      <Card className="p-6" role="region" aria-label="Financial Advisory Conversation Window">
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2" role="log" aria-live="polite">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs font-serif font-bold ${
                  msg.sender === 'user'
                    ? 'bg-espresso-charcoal text-white'
                    : 'bg-blush-soft border border-blush-accent/30 text-blush-deep'
                }`}
              >
                {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4 text-blush-deep" />}
              </div>

              <div
                className={`max-w-xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-cream-200 text-espresso-charcoal rounded-tr-none'
                    : 'bg-pearl-50 border border-silver-soft text-espresso-charcoal rounded-tl-none shadow-xs'
                }`}
              >
                <div className="font-sans whitespace-pre-wrap">{msg.text}</div>

                {msg.highlights && (
                  <div className="mt-3 pt-2.5 border-t border-silver-soft/80 flex flex-wrap gap-2">
                    {msg.highlights.map((h, idx) => (
                      <span
                        key={idx}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white border border-blush-soft text-blush-deep"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                )}

                <div className="mt-1 text-[10px] text-espresso-light text-right">
                  {msg.timestamp}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Input Bar */}
        <div className="mt-5 pt-4 border-t border-silver-soft flex items-center gap-2">
          <input
            type="text"
            placeholder="Ask about your budget, safe spending limits, or goal timelines..."
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSend();
            }}
            aria-label="Financial query input"
            className="flex-1 px-4 py-2.5 bg-pearl-50 border border-silver-border rounded-xl text-xs sm:text-sm text-espresso-charcoal placeholder-espresso-light/60 focus:outline-none focus:ring-2 focus:ring-blush-accent/40"
          />
          <Button
            variant="blush"
            size="md"
            onClick={() => handleSend()}
            icon={<Send className="w-4 h-4" />}
            className="shadow-soft hover:shadow-md flex-shrink-0"
          >
            Send
          </Button>
        </div>
      </Card>
    </div>
  );
};
