import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Loader2, BarChart2 } from 'lucide-react';

interface SessionDoc { id: string; createdAt?: any; status?: string; userId?: string; }
interface RequestDoc { id: string; createdAt?: any; items?: any[]; createdBy?: { userId: string }; }

export default function AssistantAnalytics() {
  const [loading, setLoading] = useState(true);
  const [sessionCount, setSessionCount] = useState(0);
  const [closedCount, setClosedCount] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const [avgItems, setAvgItems] = useState(0);

  useEffect(() => {
    (async () => {
      try {
        const sessSnap = await getDocs(collection(db, 'assistant_sessions'));
        const sessions: SessionDoc[] = sessSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any;
        setSessionCount(sessions.length);
        setClosedCount(sessions.filter(s => s.status === 'closed').length);
        const reqSnap = await getDocs(collection(db, 'material_requests'));
        const requests: RequestDoc[] = reqSnap.docs.map(d => ({ id: d.id, ...d.data() })) as any;
        setRequestCount(requests.length);
        const totalItems = requests.reduce((sum, r) => sum + (Array.isArray(r.items) ? r.items.length : 0), 0);
        setAvgItems(requests.length ? totalItems / requests.length : 0);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold flex items-center gap-2"><BarChart2 className="h-6 w-6" /> Assistant Analytics</h1>
      {loading ? (
        <div className="flex items-center gap-2 text-sm mt-6"><Loader2 className="h-4 w-4 animate-spin" /> Loading...</div>
      ) : (
        <div className="grid md:grid-cols-4 gap-4 mt-6">
          <Card>
            <CardHeader><CardTitle className="text-sm">Sessions</CardTitle></CardHeader>
            <CardContent className="text-2xl font-semibold">{sessionCount}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Closed Sessions</CardTitle></CardHeader>
            <CardContent className="text-2xl font-semibold">{closedCount}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Material Requests</CardTitle></CardHeader>
            <CardContent className="text-2xl font-semibold">{requestCount}</CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-sm">Avg Items / Request</CardTitle></CardHeader>
            <CardContent className="text-2xl font-semibold">{avgItems.toFixed(1)}</CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
