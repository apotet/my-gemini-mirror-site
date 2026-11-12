import React from 'react';
import { CliLabShell } from './CliLabShell';

/**
 * The experimental Practice area uses the same CLI engine, scenarios, and UI.
 * Keeping a second independent shell caused stale scenarios and fixes.
 */
export const MockCliLabShell: React.FC = () => <CliLabShell />;
