'use client'
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Check, ChevronsUpDown } from 'lucide-react';
import { FaUsers, FaMedal, FaTrophy } from 'react-icons/fa';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
// import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tabs, TabsContent} from '@/components/ui/tabs';

import { Header } from '@/components/layout/header';
import { Main } from '@/components/layout/main';
import {ThemeSwitch} from '@/components/theme-switch';

type LeaderboardRow = {
    team: string
    event: string
    gold: number
    silver: number
    bronze: number
    total: number
}

type RawLeaderboardRow = {
    _id: string
    team?: string
    event?: string
    gold?: number
    silver?: number
    bronze?: number
    total?: number
}
type RawDataEntry = {
    team?: string
    event?: string
    medal?: string
    createdAt?: string
}

type EventMedalRow = {
    event: string
    gold: string
    silver: string
    bronze: string
}
interface RawScoreRow {
    team?: string
    event?: string
    medal?: string
    createdAt?: string
}
// ---------------------------
// Embedded Search component
// ---------------------------
interface SearchProps {
    value?: string
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
}

const Search: React.FC<SearchProps> = ({ value = '', onChange }) => {
    return (
        <input
            type='text'
            placeholder='Search...'
            value={value}
            onChange={onChange}
            className='w-48 rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:focus:border-blue-400 dark:focus:ring-blue-800'
        />
    )
}
const teams = [
    {
        value: 'Team A',
        label: 'Team A',
    },
    {
        value: 'Team B',
        label: 'Team B',
    },
    {
        value: 'Team C',
        label: 'Team C',
    },
    {
        value: 'Team D',
        label: 'Team D',
    },
    {
        value: 'Team E',
        label: 'Team E',
    },
    {
        value: 'Team F',
        label: 'Team F',
    },
]
const events = [
    // Athletics – Track Events
    { value: '100m-men', label: '100 m (Men)' },
    { value: '100m-women', label: '100 m (Women)' },

    { value: '200m-men', label: '200 m (Men)' },
    { value: '200m-women', label: '200 m (Women)' },

    { value: '400m-men', label: '400 m (Men)' },
    { value: '400m-women', label: '400 m (Women)' },

    { value: '800m-men', label: '800 m (Men)' },
    { value: '800m-women', label: '800 m (Women)' },

    { value: '1500m-men', label: '1500 m (Men)' },
    { value: '1500m-women', label: '1500 m (Women)' },

    { value: '3000m-men', label: '3000 m (Men)' },
    { value: '3000m-women', label: '3000 m (Women)' },

    { value: '4x100m-relay-men', label: '4 × 100 m Relay (Men)' },
    { value: '4x100m-relay-women', label: '4 × 100 m Relay (Women)' },

    { value: '4x400m-relay-men', label: '4 × 400 m Relay (Men)' },
    { value: '4x400m-relay-women', label: '4 × 400 m Relay (Women)' },

    { value: 'hurdles-men', label: 'Hurdles (Men – 110 m / 400 m)' },
    { value: 'hurdles-women', label: 'Hurdles (Women – 100 m / 400 m)' },

    // Athletics – Field Events
    { value: 'long-jump-men', label: 'Long Jump (Men)' },
    { value: 'long-jump-women', label: 'Long Jump (Women)' },

    { value: 'high-jump-men', label: 'High Jump (Men)' },
    { value: 'high-jump-women', label: 'High Jump (Women)' },

    { value: 'triple-jump-men', label: 'Triple Jump (Men)' },
    { value: 'triple-jump-women', label: 'Triple Jump (Women)' },

    { value: 'shot-put-men', label: 'Shot Put (Men)' },
    { value: 'shot-put-women', label: 'Shot Put (Women)' },

    { value: 'discus-throw-men', label: 'Discus Throw (Men)' },
    { value: 'discus-throw-women', label: 'Discus Throw (Women)' },

    { value: 'javelin-throw-men', label: 'Javelin Throw (Men)' },
    { value: 'javelin-throw-women', label: 'Javelin Throw (Women)' },

    { value: 'hammer-throw-men', label: 'Hammer Throw (Men)' },
    { value: 'hammer-throw-women', label: 'Hammer Throw (Women)' },

    // Team Sports
    { value: 'football-men', label: 'Football (Men)' },
    { value: 'football-women', label: 'Football (Women)' },

    { value: 'basketball-men', label: 'Basketball (Men)' },
    { value: 'basketball-women', label: 'Basketball (Women)' },

    { value: 'volleyball-men', label: 'Volleyball (Men)' },
    { value: 'volleyball-women', label: 'Volleyball (Women)' },

    { value: 'handball-men', label: 'Handball (Men)' },
    { value: 'handball-women', label: 'Handball (Women)' },

    // Individual / Dual Sports
    { value: 'badminton-men', label: 'Badminton (Men)' },
    { value: 'badminton-women', label: 'Badminton (Women)' },

    { value: 'table-tennis-men', label: 'Table Tennis (Men)' },
    { value: 'table-tennis-women', label: 'Table Tennis (Women)' },

    { value: 'tennis-men', label: 'Tennis (Men)' },
    { value: 'tennis-women', label: 'Tennis (Women)' },

    { value: 'chess-men', label: 'Chess (Men)' },
    { value: 'chess-women', label: 'Chess (Women)' },

    { value: 'taekwondo-men', label: 'Taekwondo (Men)' },
    { value: 'taekwondo-women', label: 'Taekwondo (Women)' },

    { value: 'karate-men', label: 'Karate (Men)' },
    { value: 'karate-women', label: 'Karate (Women)' },

    { value: 'judo-men', label: 'Judo (Men)' },
    { value: 'judo-women', label: 'Judo (Women)' },

    { value: 'wrestling-men', label: 'Wrestling (Men)' },
    { value: 'wrestling-women', label: 'Wrestling (Women)' },

    // Aquatic Events
    { value: 'swimming-men', label: 'Swimming (Men)' },
    { value: 'swimming-women', label: 'Swimming (Women)' },

    { value: 'medley-relay-men', label: 'Medley Relay (Men)' },
    { value: 'medley-relay-women', label: 'Medley Relay (Women)' },

    { value: 'diving-men', label: 'Diving (Men)' },
    { value: 'diving-women', label: 'Diving (Women)' },

    // Other Events
    { value: 'cross-country-men', label: 'Cross Country (Men)' },
    { value: 'cross-country-women', label: 'Cross Country (Women)' },

    { value: 'cycling-men', label: 'Cycling (Men)' },
    { value: 'cycling-women', label: 'Cycling (Women)' },

    { value: 'gymnastics-men', label: 'Gymnastics (Men)' },
    { value: 'gymnastics-women', label: 'Gymnastics (Women)' },

    { value: 'archery-men', label: 'Archery (Men)' },
    { value: 'archery-women', label: 'Archery (Women)' },
]

// ---------------------------
export function Dashboard() {
    const [leaderboardData, setLeaderboardData] = useState<LeaderboardRow[]>([])
    const [search, setSearch] = useState<string>('')
    const [error, setError] = useState<string | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [lastUpdated, setLastUpdated] = useState<string>('')
    const [uniqueEventsCount, setUniqueEventsCount] = useState<number>(0)
    const [selectedTeam, setSelectedTeam] = useState<string | null>(null)
    const [rawDataFill, setRawDataFill] = useState<RawScoreRow[]>([])
    const [showEventsTable, setShowEventsTable] = useState(false)
    const [eventValue, setEventValue] = React.useState('')

    //for combobox for teams
    const [goldOpen, setGoldOpen] = React.useState(false)
    const [goldValue, setGoldValue] = React.useState('')
    //for combobox for events
    const [eventOpen, setEventOpen] = React.useState(false)

    //for combobox for medal
    const [silverOpen, setSilverOpen] = React.useState(false)
    const [silverValue, setSilverValue] = React.useState('')

    const [bronzeOpen, setBronzeOpen] = React.useState(false)
    const [bronzeValue, setBronzeValue] = React.useState('')
    // for dissabling the combobox
    const [goldDisabled, setGoldDisabled] = useState(false)
    const [silverDisabled, setSilverDisabled] = useState(false)
    const [bronzeDisabled, setBronzeDisabled] = useState(false)
    const isSaveDisabled = goldDisabled && silverDisabled && bronzeDisabled
    const [eventsRecorded, setEventsRecorded] = useState<EventMedalRow[]>([])

    const eventsTableRef = useRef<HTMLDivElement | null>(null)

    const [passkeyDialogOpen, setPasskeyDialogOpen] = useState(false)
    const [passkey, setPasskey] = useState('')
    const [passkeyError, setPasskeyError] = useState('')



    const handleSave = async () => {
        if (!eventValue) {
            return toast.error('Please select an Event!')
        }

        // Prepare an array of medal entries
        const medalEntries = [
            { medal: 'gold', team: goldValue },
            { medal: 'silver', team: silverValue },
            { medal: 'bronze', team: bronzeValue },
        ]

        // Filter only entries with a selected team
        const filledEntries = medalEntries.filter(
            (entry) => entry.team
        )

        if (filledEntries.length === 0) {
            return toast.error('Please select at least one team!')
        }

        try {
            for (const entry of filledEntries) {
                const res = await fetch(
                    'http://localhost:4000/api/scores',
                    {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            team: entry.team,
                            event: eventValue,
                            medal: entry.medal,
                            createdAt: new Date().toISOString(),
                        }),
                    }
                )

                const data = await res.json()

                if (!res.ok) {
                    toast.error(
                        `Error saving ${entry.medal}: ${data.error}`,
                        {
                            id: `save-error-${entry.medal}`,
                        }
                    )
                }
            }

            toast.success('Scores saved successfully!', {
                id: 'save-success',
            })

            // Reset only the fields that were submitted
            if (goldValue) setGoldValue('')
            if (silverValue) setSilverValue('')
            if (bronzeValue) setBronzeValue('')
            setEventValue('')
        } catch (err: unknown) {
            if (err instanceof Error) {
                toast.error('Network error: ' + err.message, {
                    id: 'save-error',
                })
            } else {
                toast.error('Network error: Unknown error', {
                    id: 'save-error',
                })
            }
        }
    }

    useEffect(() => {
        let isMounted = true

        const fetchLeaderboard = async () => {
            try {
                const res = await fetch('http://localhost:4000/api/leaderboard')
                if (!res.ok) throw new Error(`HTTP error ${res.status}`)

                const data = await res.json()

                if (!Array.isArray(data.leaderboard)) {
                    throw new Error('Invalid data from server')
                }

                if (isMounted) {
                    setRawDataFill(data.rawData)

                    const formattedData = data.leaderboard.map(
                        (row: RawLeaderboardRow) => ({
                            team: row.team ?? 'Unknown Team',
                            event: row.event ?? 'Unknown Event',
                            gold: row.gold ?? 0,
                            silver: row.silver ?? 0,
                            bronze: row.bronze ?? 0,
                            total:
                                row.total ??
                                (row.gold ?? 0) + (row.silver ?? 0) + (row.bronze ?? 0),
                        })
                    )

                    setLeaderboardData(formattedData)
                    setUniqueEventsCount(data.uniqueCount)

                    const lastCreatedAt = data.rawData
                        .map((e: RawDataEntry) => e.createdAt)
                        .filter(Boolean)
                        .sort(
                            (a: string, b: string) =>
                                new Date(b).getTime() - new Date(a).getTime()
                        )[0]

                    setLastUpdated(
                        lastCreatedAt ? new Date(lastCreatedAt).toLocaleString() : ''
                    )
                }

                setError(null)
            } catch (err: unknown) {
                if (err instanceof Error) setError(err.message)
            } finally {
                if (isMounted) setLoading(false)
            }
        }

        fetchLeaderboard()
        const interval = setInterval(fetchLeaderboard, 1000)

        return () => {
            isMounted = false
            clearInterval(interval)
        }
    }, []) // ✅ NO dependencies
    const prevEventRef = useRef<string | null>(null)

    useEffect(() => {
        if (!eventValue) {
            setGoldValue('')
            setSilverValue('')
            setBronzeValue('')

            setGoldDisabled(false)
            setSilverDisabled(false)
            setBronzeDisabled(false)

            prevEventRef.current = null
            return
        }

        // Reset only when event changes
        if (prevEventRef.current !== eventValue) {
            prevEventRef.current = eventValue

            setGoldValue('')
            setSilverValue('')
            setBronzeValue('')

            setGoldDisabled(false)
            setSilverDisabled(false)
            setBronzeDisabled(false)
        }

        const eventEntries = rawDataFill.filter(
            (entry) => entry.event === eventValue
        )

        const goldEntry = eventEntries.find((e) => e.medal === 'gold')
        const silverEntry = eventEntries.find((e) => e.medal === 'silver')
        const bronzeEntry = eventEntries.find((e) => e.medal === 'bronze')

        if (goldEntry?.team && !goldDisabled) {
            setGoldValue(goldEntry.team)
            setGoldDisabled(true)
        }

        if (silverEntry?.team && !silverDisabled) {
            setSilverValue(silverEntry.team)
            setSilverDisabled(true)
        }

        if (bronzeEntry?.team && !bronzeDisabled) {
            setBronzeValue(bronzeEntry.team)
            setBronzeDisabled(true)
        }
    }, [eventValue, rawDataFill])

    useEffect(() => {
        if (!rawDataFill?.length) return

        type TempEventRow = EventMedalRow & { latestCreatedAt: Date }

        const groupedByEvent: Record<string, TempEventRow> = {}

        rawDataFill.forEach((row) => {
            const eventName = row.event ?? 'Unknown Event'
            const teamName = row.team ?? '—'
            const medalType = row.medal?.toLowerCase()
            const createdAt = row.createdAt ? new Date(row.createdAt) : new Date(0) // fallback

            // Initialize event row if it doesn't exist
            if (!groupedByEvent[eventName]) {
                groupedByEvent[eventName] = {
                    event: eventName,
                    gold: '—',
                    silver: '—',
                    bronze: '—',
                    latestCreatedAt: createdAt,
                }
            }

            // Assign team to correct medal
            if (medalType === 'gold') groupedByEvent[eventName].gold = teamName
            if (medalType === 'silver') groupedByEvent[eventName].silver = teamName
            if (medalType === 'bronze') groupedByEvent[eventName].bronze = teamName

            // Update latestCreatedAt if this row is newer
            if (createdAt > groupedByEvent[eventName].latestCreatedAt) {
                groupedByEvent[eventName].latestCreatedAt = createdAt
            }
        })
        const sortedEvents: TempEventRow[] = Object.values(groupedByEvent)
            .filter((row: TempEventRow) => {
                const searchableString = [row.event, row.gold, row.silver, row.bronze]
                    .map((val) => (val != null ? String(val).toLowerCase() : ''))
                    .join(' ')
                return searchableString.includes(search.toLowerCase())
            })
            .sort((a, b) => b.latestCreatedAt.getTime() - a.latestCreatedAt.getTime())


        // Remove latestCreatedAt before saving to state
        setEventsRecorded(sortedEvents.map(({ latestCreatedAt, ...rest }) => rest))
    }, [rawDataFill])

    // ---------------------------
    // Filter leaderboard based on search
    // ---------------------------
    const filteredData = useMemo(
        () =>
            leaderboardData.filter((row) =>
                row.team.toLowerCase().includes(search.toLowerCase())
            ),
        [leaderboardData, search]
    )
    const filteredTeamData = selectedTeam
        ? rawDataFill
            .filter(
                (row) =>
                    row.team === selectedTeam &&
                    row.event?.toLowerCase().includes(search.toLowerCase()) // <-- search filter
            )
            .sort((a, b) => {
                const medalA = a.medal?.toLowerCase() ?? ''
                const medalB = b.medal?.toLowerCase() ?? ''

                // Medal ranking: Gold first, then Silver, then Bronze
                const getMedalRank = (medal: string) => {
                    if (medal === 'gold') return 1
                    if (medal === 'silver') return 2
                    if (medal === 'bronze') return 3
                    return 99
                }

                const rankA = getMedalRank(medalA)
                const rankB = getMedalRank(medalB)

                if (rankA !== rankB) {
                    return rankA - rankB
                }

                // Sort by createdAt descending (latest first), fallback to 0 if missing
                const timeA = a.createdAt ? new Date(a.createdAt).getTime() : 0
                const timeB = b.createdAt ? new Date(b.createdAt).getTime() : 0

                return timeB - timeA
            })
        : []

    function formatEventName(eventName: string) {
        if (!eventName) return 'Unknown'

        // Split by dash
        const parts = eventName.split('-')
        if (parts.length === 0) return eventName

        // Extract the gender (last part)
        const gender = parts.pop() ?? 'Unknown' // fallback if undefined

        // Capitalize each word in the remaining parts
        const formattedName = parts
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ')

        // Capitalize gender if it's a string
        const formattedGender =
            typeof gender === 'string'
                ? gender.charAt(0).toUpperCase() + gender.slice(1)
                : 'Unknown'

        return `${formattedName} (${formattedGender})`
    }

    // for search

    return (
        <>
            <Header>
                <div className='ms-auto flex items-center space-x-4'>
                    <Search value={search} onChange={(e) => setSearch(e.target.value)} />
                    <ThemeSwitch />
                </div>
            </Header>

            <Main>
                <div className='mb-2 flex items-center justify-between'>
                    <h1 className='text-2xl font-bold tracking-tight'>Leaderboards</h1>
                </div>
                {/*//for error handling*/}
                {loading && (
                    <div className='mb-2 text-sm text-gray-500'>
                        Loading leaderboard...
                    </div>
                )}

                {error && (
                    <div className='mb-2 text-sm text-red-500'>
                        Failed to load leaderboard: {error}
                    </div>
                )}
                <div className='mb-4 flex justify-end'>
                    <Dialog open={passkeyDialogOpen} onOpenChange={setPasskeyDialogOpen}>
                        <DialogContent
                            style={{
                                maxWidth: '400px', // set a sensible width
                                width: '90%',       // responsive on small screens
                                margin: 'auto',     // center in the parent dialog
                                zIndex: 9999,       // make sure it's above the parent
                            }}
                        >
                            <DialogHeader>
                                <DialogTitle>Enter Passkey</DialogTitle>
                            </DialogHeader>

                            <input
                                type="password"
                                value={passkey}
                                onChange={(e) => setPasskey(e.target.value)}
                                autoFocus
                                style={{
                                    width: '100%',
                                    padding: '8px',
                                    borderRadius: '4px',
                                    border: passkeyError ? '1px solid red' : '1px solid #ccc', // red if invalid, else subtle
                                    outline: 'none',

                                    boxSizing: 'border-box', // ensures padding doesn't break width
                                    marginTop: '8px',
                                }}
                            />

                            {passkeyError && (
                                <p style={{ color: 'red', marginTop: 4 }}>
                                    Invalid passkey
                                </p>
                            )}

                            <DialogFooter>
                                <Button
                                    variant="secondary"
                                    onClick={() => setPasskeyDialogOpen(false)}
                                >
                                    Cancel
                                </Button>

                                <Button
                                    onClick={async () => {
                                        if (passkey !== '1234') {
                                            setPasskeyError('Invalid passkey')
                                            return
                                        }

                                        setPasskeyDialogOpen(false)
                                        await handleSave() // your unchanged save logic
                                    }}
                                >
                                    Confirm
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <Dialog>
                        <form>
                            <DialogTrigger asChild >
                                <Button variant="secondary"  className="fixed top-16 right-4 z-50">Add Score</Button>
                            </DialogTrigger>
                            <DialogContent className='sm:max-w-106.25'>
                                <DialogHeader>
                                    <DialogTitle>Event Detail</DialogTitle>
                                </DialogHeader>
                                <div className='grid gap-4'>
                                    <div className='grid gap-3'>
                                        <Label htmlFor='name-1'>Select Event</Label>
                                        <Popover
                                            open={eventOpen}
                                            onOpenChange={setEventOpen}
                                            modal={true}
                                        >
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant='outline'
                                                    role='combobox'
                                                    aria-expanded={eventOpen}
                                                    className='justify-between'
                                                >
                                                    {eventValue
                                                        ? events.find(
                                                            (events) => events.value === eventValue
                                                        )?.label
                                                        : 'Select Event...'}
                                                    <ChevronsUpDown className='opacity-50' />
                                                </Button>
                                            </PopoverTrigger>

                                            <PopoverContent className='w-50 p-0'>
                                                <Command>
                                                    <CommandInput
                                                        placeholder='Search Event...'
                                                        className='h-9'
                                                    />
                                                    <CommandList>
                                                        <CommandEmpty>No Event found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {events.map((events) => (
                                                                <CommandItem
                                                                    key={events.value}
                                                                    value={events.value}
                                                                    onSelect={(currentValue) => {
                                                                        setEventValue(
                                                                            currentValue === eventValue
                                                                                ? ''
                                                                                : currentValue
                                                                        )
                                                                        setEventOpen(false)
                                                                    }}
                                                                >
                                                                    {events.label}
                                                                    <Check
                                                                        className={cn(
                                                                            'ml-auto',
                                                                            eventValue === events.value
                                                                                ? 'opacity-100'
                                                                                : 'opacity-0'
                                                                        )}
                                                                    />
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className='grid gap-3'>
                                        <Label htmlFor='name-1'>
                                            <FaTrophy className='text-yellow-400' /> Gold Medal
                                        </Label>
                                        <Popover
                                            open={goldOpen}
                                            onOpenChange={setGoldOpen}
                                            modal={true}
                                        >
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant='outline'
                                                    role='combobox'
                                                    aria-expanded={goldOpen}
                                                    className='justify-between'
                                                    disabled={goldDisabled}
                                                >
                                                    {goldValue
                                                        ? teams.find((teams) => teams.value === goldValue)
                                                            ?.label
                                                        : 'Select Team...'}
                                                    <ChevronsUpDown className='opacity-50' />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-64 p-0'>
                                                <Command>
                                                    <CommandInput
                                                        placeholder='Search Team...'
                                                        className='h-9'
                                                    />
                                                    <ScrollArea className='max-h-64'>
                                                        <CommandList>
                                                            <CommandEmpty>No Event found.</CommandEmpty>
                                                            <CommandGroup>
                                                                {teams.map((team) => (
                                                                    <CommandItem
                                                                        key={team.value}
                                                                        value={team.value}
                                                                        onSelect={(currentValue) => {
                                                                            setGoldValue(
                                                                                currentValue === goldValue
                                                                                    ? ''
                                                                                    : currentValue
                                                                            )
                                                                            setGoldOpen(false)
                                                                        }}
                                                                    >
                                                                        {team.label}
                                                                        <Check
                                                                            className={cn(
                                                                                'ml-auto',
                                                                                goldValue === team.value
                                                                                    ? 'opacity-100'
                                                                                    : 'opacity-0'
                                                                            )}
                                                                        />
                                                                    </CommandItem>
                                                                ))}
                                                            </CommandGroup>
                                                        </CommandList>
                                                    </ScrollArea>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className='grid gap-3'>
                                        <Label htmlFor='name-1'>
                                            {' '}
                                            <FaTrophy className='text-gray-400' />
                                            Silver Medal
                                        </Label>
                                        <Popover open={silverOpen} onOpenChange={setSilverOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant='outline'
                                                    role='combobox'
                                                    aria-expanded={silverOpen}
                                                    className='justify-between'
                                                    disabled={silverDisabled}
                                                >
                                                    {silverValue
                                                        ? teams.find((team) => team.value === silverValue)
                                                            ?.label
                                                        : 'Select Team...'}
                                                    <ChevronsUpDown className='opacity-50' />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-50 p-0'>
                                                <Command>
                                                    <CommandInput
                                                        placeholder='Search Team...'
                                                        className='h-9'
                                                    />
                                                    <CommandList className='max-h-60 overflow-y-auto'>
                                                        <CommandEmpty>No Medal found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {teams.map((team) => (
                                                                <CommandItem
                                                                    key={team.value}
                                                                    value={team.value}
                                                                    onSelect={(currentValue) => {
                                                                        setSilverValue(
                                                                            currentValue === silverValue
                                                                                ? ''
                                                                                : currentValue
                                                                        )
                                                                        setSilverOpen(false)
                                                                    }}
                                                                >
                                                                    {team.label}
                                                                    <Check
                                                                        className={cn(
                                                                            'ml-auto',
                                                                            silverValue === team.value
                                                                                ? 'opacity-100'
                                                                                : 'opacity-0'
                                                                        )}
                                                                    />
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                    <div className='grid gap-3'>
                                        <Label htmlFor='name-1'>
                                            <FaTrophy className='text-orange-400' />
                                            Bronze Medal
                                        </Label>
                                        <Popover open={bronzeOpen} onOpenChange={setBronzeOpen}>
                                            <PopoverTrigger asChild>
                                                <Button
                                                    variant='outline'
                                                    role='combobox'
                                                    aria-expanded={bronzeOpen}
                                                    className='justify-between'
                                                    disabled={bronzeDisabled}
                                                >
                                                    {bronzeValue
                                                        ? teams.find((team) => team.value === bronzeValue)
                                                            ?.label
                                                        : 'Select Team...'}
                                                    <ChevronsUpDown className='opacity-50' />
                                                </Button>
                                            </PopoverTrigger>
                                            <PopoverContent className='w-50 p-0'>
                                                <Command>
                                                    <CommandInput
                                                        placeholder='Search Team...'
                                                        className='h-9'
                                                    />
                                                    <CommandList className='max-h-60 overflow-y-auto'>
                                                        <CommandEmpty>No Team found.</CommandEmpty>
                                                        <CommandGroup>
                                                            {teams.map((team) => (
                                                                <CommandItem
                                                                    key={team.value}
                                                                    value={team.value}
                                                                    onSelect={(currentValue) => {
                                                                        setBronzeValue(
                                                                            currentValue === bronzeValue
                                                                                ? ''
                                                                                : currentValue
                                                                        )
                                                                        setBronzeOpen(false)
                                                                    }}
                                                                >
                                                                    {team.label}
                                                                    <Check
                                                                        className={cn(
                                                                            'ml-auto',
                                                                            bronzeValue === team.value
                                                                                ? 'opacity-100'
                                                                                : 'opacity-0'
                                                                        )}
                                                                    />
                                                                </CommandItem>
                                                            ))}
                                                        </CommandGroup>
                                                    </CommandList>
                                                </Command>
                                            </PopoverContent>
                                        </Popover>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <DialogClose asChild>
                                        <Button variant='outline'>Cancel</Button>
                                    </DialogClose>
                                    <Button
                                        type="button"
                                        disabled={isSaveDisabled}
                                        onClick={() => {
                                            setPasskey('')
                                            setPasskeyError('')
                                            setPasskeyDialogOpen(true)
                                        }}
                                    >
                                        Save Score
                                    </Button>

                                </DialogFooter>
                            </DialogContent>
                        </form>
                    </Dialog>
                </div>
                {/*{loading && (*/}
                {/*  <div className='mb-2 text-sm text-gray-500'>*/}
                {/*    Loading leaderboard...*/}
                {/*  </div>*/}
                {/*)}*/}
                {/*{error && <div className='mb-2 text-sm text-red-500'>{error}</div>}*/}

                <Tabs
                    orientation='vertical'
                    defaultValue='overview'
                    className='space-y-4'
                >
                    {/*<div className='w-full overflow-x-auto pb-2'>*/}
                    {/*  <TabsList>*/}
                    {/*    <TabsTrigger value='overview'>Overall</TabsTrigger>*/}
                    {/*    <TabsTrigger value='analytics'>Elementary</TabsTrigger>*/}
                    {/*    <TabsTrigger value='secondary'>Secondary</TabsTrigger>*/}
                    {/*    <TabsTrigger value='paragames'>Paragames</TabsTrigger>*/}
                    {/*  </TabsList>*/}
                    {/*</div>*/}

                    {/* ===== OVERVIEW TAB ===== */}
                    <TabsContent value='overview' className='space-y-6' forceMount>
                        {/* ===== Stats Cards ===== */}
                        <div className='grid gap-4 sm:grid-cols-2 lg:grid-cols-3'>
                            <Card>
                                <CardHeader className='pb-2'>
                                    <CardTitle className='text-sm font-medium'>
                                        Participating Teams
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className='text-2xl font-bold'>
                                        {leaderboardData.length}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card
                                className='transform cursor-pointer border transition-all duration-200 hover:-translate-y-1 hover:border-blue-900'
                                onClick={() => {
                                    setShowEventsTable(true)
                                    setSelectedTeam(null)

                                    // Small timeout ensures state updates before scrolling
                                    setTimeout(() => {
                                        eventsTableRef.current?.scrollIntoView({
                                            behavior: 'smooth',
                                            block: 'start',
                                        })
                                    }, 100)
                                }}
                            >
                                <CardHeader className='pb-2'>
                                    <CardTitle className='text-sm font-medium'>
                                        Events Recorded
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className='text-2xl font-bold'>{uniqueEventsCount}</div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader className='pb-2'>
                                    <CardTitle className='text-sm font-medium'>
                                        Total Medals
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className='text-2xl font-bold'>
                                        {leaderboardData.reduce((acc, row) => acc + row.total, 0)}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* ===== Leaderboard Table ===== */}
                        {!showEventsTable ? (
                            <Card>
                                <CardHeader className='flex items-center justify-between gap-4'>
                                    <div className='flex flex-col'>
                                        {selectedTeam
                                            ? `${selectedTeam} – Event Results`
                                            : 'Official Result Tally Board'}
                                        {
                                            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                                                Last updated: {lastUpdated || 'Loading...'}
                                            </p>
                                        }
                                    </div>
                                    {selectedTeam && (
                                        <Button
                                            variant='outline'
                                            onClick={() => {
                                                setShowEventsTable(false)
                                                setSelectedTeam(null)
                                            }}
                                        >
                                            Back
                                        </Button>
                                    )}
                                </CardHeader>

                                <CardContent className='overflow-x-auto'>
                                    {!selectedTeam ? (
                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className='w-2/5'>
                                                        <div className='flex items-center space-x-1'>
                                                            <FaUsers className='text-gray-500 dark:text-gray-400' />
                                                            <span>Team</span>
                                                        </div>
                                                    </TableHead>
                                                    <TableHead>
                                                        <div className='flex items-center justify-center space-x-1'>
                                                            <FaTrophy className='text-yellow-400' />
                                                            <span>Gold</span>
                                                        </div>
                                                    </TableHead>
                                                    <TableHead>
                                                        <div className='flex items-center justify-center space-x-1'>
                                                            <FaTrophy className='text-gray-400' />
                                                            <span>Silver</span>
                                                        </div>
                                                    </TableHead>
                                                    <TableHead>
                                                        <div className='flex items-center justify-center space-x-1'>
                                                            <FaTrophy className='text-orange-600' />
                                                            <span>Bronze</span>
                                                        </div>
                                                    </TableHead>
                                                    <TableHead>
                                                        <div className='flex items-center justify-center space-x-1'>
                                                            <FaMedal className='text-purple-500' />
                                                            <span>Total</span>
                                                        </div>
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>

                                            <TableBody>
                                                {filteredData.length > 0 ? (
                                                    filteredData.map((row, index) => (
                                                        <TableRow
                                                            key={row.team + index}
                                                            className={`${
                                                                index % 2 === 0
                                                                    ? 'bg-white dark:bg-gray-900'
                                                                    : 'bg-gray-50 dark:bg-gray-800'
                                                            } cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700`}
                                                            onClick={() => {
                                                                setSelectedTeam(row.team)
                                                            }}
                                                        >
                                                            <TableCell>{row.team}</TableCell>
                                                            <TableCell className='text-center'>
                                                                {row.gold}
                                                            </TableCell>
                                                            <TableCell className='text-center'>
                                                                {row.silver}
                                                            </TableCell>
                                                            <TableCell className='text-center'>
                                                                {row.bronze}
                                                            </TableCell>
                                                            <TableCell className='text-center'>
                                                                {row.total}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell
                                                            colSpan={5}
                                                            className='text-center text-gray-500'
                                                        >
                                                            {loading ? 'Loading...' : 'No teams found.'}
                                                        </TableCell>
                                                    </TableRow>
                                                )}
                                            </TableBody>
                                        </Table>
                                    ) : (
                                        <TabsContent
                                            value='team-detail'
                                            className='space-y-6'
                                            forceMount
                                        >
                                            <div className='mb-4 items-center justify-between'>
                                                <h2 className='text-xl font-bold'>
                                                    {selectedTeam} - Event Wins
                                                </h2>
                                                <hr />
                                            </div>
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Events</TableHead>
                                                        <TableHead className='text-center'>
                                                            Medal Earned
                                                        </TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {filteredTeamData.length > 0 ? (
                                                        filteredTeamData.map((row, index) => (
                                                            <TableRow
                                                                key={(row.team ?? 'Unknown') + index}
                                                                className={`${
                                                                    index % 2 === 0
                                                                        ? 'bg-white dark:bg-gray-900'
                                                                        : 'bg-gray-50 dark:bg-gray-800'
                                                                } cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700`}
                                                            >
                                                                <TableCell>
                                                                    {formatEventName(row.event as string) ??
                                                                        'Unknown Event'}
                                                                </TableCell>
                                                                <TableCell className='text-center'>
                                                                    {row.medal ? (
                                                                        <span
                                                                            className={`rounded px-2 py-1 font-semibold text-white ${
                                                                                row.medal.toLowerCase() === 'gold'
                                                                                    ? 'bg-yellow-500'
                                                                                    : row.medal.toLowerCase() === 'silver'
                                                                                        ? 'bg-gray-400'
                                                                                        : row.medal.toLowerCase() ===
                                                                                        'bronze'
                                                                                            ? 'bg-orange-600'
                                                                                            : 'bg-gray-300 text-black'
                                                                            }`}
                                                                        >
                                      {row.medal.charAt(0).toUpperCase() +
                                          row.medal.slice(1).toLowerCase()}
                                    </span>
                                                                    ) : (
                                                                        'None'
                                                                    )}
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    ) : (
                                                        <TableRow>
                                                            <TableCell
                                                                colSpan={5}
                                                                className='text-center text-gray-500'
                                                            >
                                                                {loading ? 'Loading...' : 'No Event found.'}
                                                            </TableCell>
                                                        </TableRow>
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </TabsContent>
                                    )}
                                </CardContent>
                            </Card>
                        ) : (

                            <Card>
                                <CardHeader className='flex items-center justify-between gap-4'>
                                    <div className='flex flex-col'>
                                        {selectedTeam
                                            ? `${selectedTeam} – Event Results`
                                            : 'Official Result Tally Board'}
                                        {!selectedTeam && (
                                            <p className='mt-1 text-sm text-gray-500 dark:text-gray-400'>
                                                Last updated: {lastUpdated || 'Loading...'}
                                            </p>
                                        )}
                                    </div>
                                    {showEventsTable && (
                                        <Button
                                            variant='outline'
                                            onClick={() => {
                                                setSelectedTeam(null)
                                                setShowEventsTable(false)
                                            }}
                                        >
                                            Back
                                        </Button>
                                    )}
                                </CardHeader>
                                <div ref={eventsTableRef} className="scroll-mt-24 md:scroll-mt-96">
                                    { <CardContent className='space-y-4 overflow-x-auto'>
                                        <div className='items-cente mb-4'>
                                            <h2 className='text-xl font-bold'>Events Recorded</h2>
                                            <hr />
                                        </div>

                                        <Table>
                                            <TableHeader>
                                                <TableRow>
                                                    <TableHead className='w-2/5'>
                                                        <div className='flex items-center space-x-1'>
                                                            <FaUsers className='text-gray-500 dark:text-gray-400' />
                                                            <span>Team</span>
                                                        </div>
                                                    </TableHead>
                                                    <TableHead>
                                                        <div className='flex items-center justify-center space-x-1'>
                                                            <FaTrophy className='text-yellow-400' />
                                                            <span>Gold</span>
                                                        </div>
                                                    </TableHead>
                                                    <TableHead>
                                                        <div className='flex items-center justify-center space-x-1'>
                                                            <FaTrophy className='text-gray-400' />
                                                            <span>Silver</span>
                                                        </div>
                                                    </TableHead>
                                                    <TableHead>
                                                        <div className='flex items-center justify-center space-x-1'>
                                                            <FaTrophy className='text-orange-600' />
                                                            <span>Bronze</span>
                                                        </div>
                                                    </TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {eventsRecorded.length === 0 ? (
                                                    <TableRow>
                                                        <TableCell colSpan={5} className="text-center text-gray-500">
                                                            {loading ? "Loading..." : "No Record found."}
                                                        </TableCell>
                                                    </TableRow>
                                                ) : (
                                                    eventsRecorded.map((event, index) => (
                                                        <TableRow
                                                            key={`${event.event}-${index}`}
                                                            className={`${
                                                                index % 2 === 0 ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"
                                                            } cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700`}
                                                        >
                                                            <TableCell>{formatEventName(event.event)}</TableCell>
                                                            <TableCell className="text-center">{event.gold || "—"}</TableCell>
                                                            <TableCell className="text-center">{event.silver || "—"}</TableCell>
                                                            <TableCell className="text-center">{event.bronze || "—"}</TableCell>
                                                        </TableRow>
                                                    ))
                                                )}
                                            </TableBody>
                                        </Table>


                                    </CardContent> }
                                </div>

                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </Main>
        </>
    )
}
