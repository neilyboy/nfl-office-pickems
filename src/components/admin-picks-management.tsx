'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { 
  ArrowLeft, 
  ChevronLeft,
  ChevronRight,
  Edit,
  Check,
  X
} from 'lucide-react';
import { getInitials, getDayOfWeek } from '@/lib/utils';
import { ESPNGame } from '@/lib/espn-api';
import { getTeamLogoPath } from '@/lib/team-mappings';
import Image from 'next/image';

interface UserPick {
  userId: number;
  username: string;
  firstName: string;
  lastName: string;
  avatarColor: string;
  picks: Array<{
    gameId: string;
    pickedTeamId: string;
  }>;
  mondayGuess: number | null;
}

export function AdminPicksManagement() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState<ESPNGame[]>([]);
  const [userPicks, setUserPicks] = useState<UserPick[]>([]);
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [editingUser, setEditingUser] = useState<number | null>(null);
  const [editedPicks, setEditedPicks] = useState<any>({});
  const [editedMondayGuess, setEditedMondayGuess] = useState<string>('');
  const [week, setWeek] = useState(0);
  const [currentWeek, setCurrentWeek] = useState(0);
  const [season, setSeason] = useState(0);

  useEffect(() => {
    fetchPicksData();
  }, [week]);

  const fetchPicksData = async () => {
    setLoading(true);
    try {
      const url = week > 0 
        ? `/api/admin/picks?week=${week}` 
        : '/api/admin/picks';
      const response = await fetch(url);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load data');
      }

      setGames(data.games || []);
      setUserPicks(data.userPicks || []);
      setWeek(data.week);
      setCurrentWeek(data.currentWeek || data.week);
      setSeason(data.season);
      
      if (data.userPicks && data.userPicks.length > 0) {
        setSelectedUser(data.userPicks[0].userId);
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (userId: number) => {
    const user = userPicks.find(u => u.userId === userId);
    if (!user) return;

    const picksMap: any = {};
    user.picks.forEach(pick => {
      picksMap[pick.gameId] = pick.pickedTeamId;
    });

    setEditingUser(userId);
    setEditedPicks(picksMap);
    setEditedMondayGuess(user.mondayGuess?.toString() || '');
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditedPicks({});
    setEditedMondayGuess('');
  };

  const handleSaveEdits = async () => {
    if (!editingUser) return;

    try {
      const picks = Object.entries(editedPicks).map(([gameId, pickedTeamId]) => ({
        gameId,
        pickedTeamId,
      }));

      const response = await fetch(`/api/admin/picks/${editingUser}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          week,
          season,
          picks,
          mondayGuess: editedMondayGuess ? parseInt(editedMondayGuess) : null,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save picks');
      }

      toast({
        title: 'Picks Updated! ✅',
        description: 'User picks saved successfully',
      });

      setEditingUser(null);
      setEditedPicks({});
      setEditedMondayGuess('');
      fetchPicksData();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const handlePickChange = (gameId: string, teamId: string) => {
    setEditedPicks((prev: any) => ({
      ...prev,
      [gameId]: teamId,
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading picks...</p>
        </div>
      </div>
    );
  }

  const selectedUserData = userPicks.find(u => u.userId === selectedUser);
  const isEditing = editingUser === selectedUser;
  const currentPicks = isEditing ? editedPicks : (selectedUserData?.picks.reduce((acc: any, pick) => {
    acc[pick.gameId] = pick.pickedTeamId;
    return acc;
  }, {}) || {});

  const getGamesByDay = () => {
    const gamesByDay = new Map<string, ESPNGame[]>();
    games.forEach(game => {
      const day = getDayOfWeek(game.date);
      if (!gamesByDay.has(day)) {
        gamesByDay.set(day, []);
      }
      gamesByDay.get(day)!.push(game);
    });
    return gamesByDay;
  };

  const gamesByDay = getGamesByDay();
  const dayOrder = ['Thursday', 'Friday', 'Saturday', 'Sunday', 'Monday'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => router.push('/admin')}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setWeek(w => Math.max(1, w - 1))}
                  disabled={week <= 1 || loading || editingUser !== null}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold">Manage Picks</h1>
                    {week === currentWeek && (
                      <Badge variant="default" className="text-xs">Current Week</Badge>
                    )}
                    {week < currentWeek && (
                      <Badge variant="secondary" className="text-xs">Past</Badge>
                    )}
                    {week > currentWeek && (
                      <Badge variant="outline" className="text-xs">Future</Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Week {week} • {season} Season
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setWeek(w => Math.min(18, w + 1))}
                  disabled={week >= 18 || loading || editingUser !== null}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* User List Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Users ({userPicks.length})</CardTitle>
                <CardDescription>Select to view/edit picks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {userPicks.map((user) => (
                  <button
                    key={user.userId}
                    onClick={() => {
                      if (editingUser === null) {
                        setSelectedUser(user.userId);
                      }
                    }}
                    disabled={editingUser !== null}
                    className={`w-full p-3 rounded-lg border transition-colors ${
                      selectedUser === user.userId
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-card hover:bg-accent'
                    } ${editingUser !== null ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8" style={{ backgroundColor: user.avatarColor }}>
                        <AvatarFallback style={{ backgroundColor: user.avatarColor, color: 'white' }}>
                          {getInitials(user.firstName, user.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="text-left flex-1 min-w-0">
                        <p className="font-semibold truncate text-sm">
                          {user.firstName} {user.lastName}
                        </p>
                        <p className="text-xs opacity-80 truncate">
                          {user.picks.length}/{games.length} picks
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
                {userPicks.length === 0 && (
                  <p className="text-center text-muted-foreground py-8 text-sm">
                    No users have made picks yet
                  </p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Picks Display/Edit Area */}
          <div className="lg:col-span-3">
            {selectedUserData ? (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-12 h-12" style={{ backgroundColor: selectedUserData.avatarColor }}>
                        <AvatarFallback style={{ backgroundColor: selectedUserData.avatarColor, color: 'white' }}>
                          {getInitials(selectedUserData.firstName, selectedUserData.lastName)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <CardTitle>{selectedUserData.firstName} {selectedUserData.lastName}</CardTitle>
                        <CardDescription>@{selectedUserData.username}</CardDescription>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {isEditing ? (
                        <>
                          <Button variant="outline" size="sm" onClick={handleCancelEdit}>
                            <X className="w-4 h-4 mr-2" />
                            Cancel
                          </Button>
                          <Button size="sm" onClick={handleSaveEdits}>
                            <Check className="w-4 h-4 mr-2" />
                            Save
                          </Button>
                        </>
                      ) : (
                        <Button size="sm" onClick={() => handleEditUser(selectedUserData.userId)}>
                          <Edit className="w-4 h-4 mr-2" />
                          Edit Picks
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  {dayOrder.map(day => {
                    const dayGames = gamesByDay.get(day);
                    if (!dayGames || dayGames.length === 0) return null;

                    return (
                      <div key={day}>
                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                          {day}
                          <Badge variant="secondary">{dayGames.length}</Badge>
                        </h3>
                        <div className="space-y-3">
                          {dayGames.map(game => {
                            const homeTeam = game.competitions[0].competitors.find(c => c.homeAway === 'home');
                            const awayTeam = game.competitions[0].competitors.find(c => c.homeAway === 'away');
                            const pickedTeamId = currentPicks[game.id];

                            if (!homeTeam || !awayTeam) return null;

                            return (
                              <div key={game.id} className="border rounded-lg p-4">
                                <div className="space-y-2">
                                  {/* Away Team */}
                                  <button
                                    onClick={() => isEditing && handlePickChange(game.id, awayTeam.team.id)}
                                    disabled={!isEditing}
                                    className={`w-full p-3 rounded-lg border-2 transition-all ${
                                      pickedTeamId === awayTeam.team.id
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border'
                                    } ${isEditing ? 'cursor-pointer hover:border-primary/50' : 'cursor-default'}`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 relative">
                                        <Image
                                          src={getTeamLogoPath(awayTeam.team.abbreviation)}
                                          alt={awayTeam.team.name}
                                          width={32}
                                          height={32}
                                          className="object-contain"
                                        />
                                      </div>
                                      <p className="font-semibold text-sm">{awayTeam.team.displayName}</p>
                                    </div>
                                  </button>

                                  {/* Home Team */}
                                  <button
                                    onClick={() => isEditing && handlePickChange(game.id, homeTeam.team.id)}
                                    disabled={!isEditing}
                                    className={`w-full p-3 rounded-lg border-2 transition-all ${
                                      pickedTeamId === homeTeam.team.id
                                        ? 'border-primary bg-primary/10'
                                        : 'border-border'
                                    } ${isEditing ? 'cursor-pointer hover:border-primary/50' : 'cursor-default'}`}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 relative">
                                        <Image
                                          src={getTeamLogoPath(homeTeam.team.abbreviation)}
                                          alt={homeTeam.team.name}
                                          width={32}
                                          height={32}
                                          className="object-contain"
                                        />
                                      </div>
                                      <p className="font-semibold text-sm">{homeTeam.team.displayName}</p>
                                    </div>
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}

                  {/* Monday Guess */}
                  <div className="border rounded-lg p-4 bg-secondary/20">
                    <h3 className="font-semibold mb-2">Monday Night Guess</h3>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editedMondayGuess}
                        onChange={(e) => setEditedMondayGuess(e.target.value)}
                        className="w-full p-2 border rounded-lg bg-background"
                        placeholder="Total points"
                      />
                    ) : (
                      <p className="text-2xl font-bold">
                        {selectedUserData.mondayGuess || 'No guess'}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">Select a user to view their picks</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
