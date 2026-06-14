import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import StatCard from '../ui/StatCard';

describe('StatCard', () => {
  it('renders label and value', () => {
    render(
      <StatCard label="Test Label" value="100" />
    );

    expect(screen.getByText('Test Label')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
  });

  it('renders subtitle when provided', () => {
    render(
      <StatCard label="Test Label" value="100" subtitle="Subtitle" />
    );

    expect(screen.getByText('Subtitle')).toBeInTheDocument();
  });

  it('renders icon when provided', () => {
    const icon = <span>Icon</span>;
    render(
      <StatCard label="Test Label" value="100" icon={icon} />
    );

    expect(screen.getByText('Icon')).toBeInTheDocument();
  });

  it('applies accent class when accent is true', () => {
    const { container } = render(
      <StatCard label="Test Label" value="100" accent />
    );

    const statCard = container.firstChild;
    expect(statCard).toHaveClass('stat-card--accent');
  });

  it('does not apply accent class when accent is false', () => {
    const { container } = render(
      <StatCard label="Test Label" value="100" accent={false} />
    );

    const statCard = container.firstChild;
    expect(statCard).not.toHaveClass('stat-card--accent');
  });

  it('renders trend indicator when trend is up', () => {
    const { container } = render(
      <StatCard label="Test Label" value="100" trend="up" />
    );

    const trend = container.querySelector('.stat-card__trend');
    expect(trend).toHaveClass('stat-card__trend--up');
    expect(trend).toHaveTextContent('▲');
  });

  it('renders trend indicator when trend is down', () => {
    const { container } = render(
      <StatCard label="Test Label" value="100" trend="down" />
    );

    const trend = container.querySelector('.stat-card__trend');
    expect(trend).toHaveClass('stat-card__trend--down');
    expect(trend).toHaveTextContent('▼');
  });

  it('renders trend indicator when trend is neutral', () => {
    const { container } = render(
      <StatCard label="Test Label" value="100" trend="neutral" />
    );

    const trend = container.querySelector('.stat-card__trend');
    expect(trend).toHaveClass('stat-card__trend--neutral');
    expect(trend).toHaveTextContent('●');
  });

  it('does not render trend indicator when trend is not provided', () => {
    const { container } = render(
      <StatCard label="Test Label" value="100" />
    );

    const trend = container.querySelector('.stat-card__trend');
    expect(trend).toBeNull();
  });
});
