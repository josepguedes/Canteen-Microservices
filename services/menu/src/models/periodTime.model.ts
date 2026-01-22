export interface PeriodTime {
  id: number;
  menu_period: 'lunch' | 'dinner';
  start_time: string;
  end_time: string;
  created_at: Date;
}