'use client';

import { Project } from '@/types';
import { Folder, MoreVertical, Trash2, Edit } from 'lucide-react';
import { format } from 'date-fns';
import { useState } from 'react';
import Link from 'next/link';

interface ProjectCardProps {
  project: Project;
  onEdit: (project: Project) => void;
  onDelete: (id: number) => void;
}

export default function ProjectCard({ project, onEdit, onDelete }: ProjectCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <Link href={`/projects/${project.id}`}>
      <div
        className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6 cursor-pointer border-l-4 relative group"
        style={{ borderLeftColor: project.color }}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3 flex-1">
            <div
              className="w-12 h-12 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${project.color}20` }}
            >
              <Folder className="w-6 h-6" style={{ color: project.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 truncate">
                {project.title}
              </h3>
              {project.description && (
                <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                  {project.description}
                </p>
              )}
            </div>
          </div>

          <div className="relative">
            <button
              onClick={(e) => {
                e.preventDefault();
                setShowMenu(!showMenu);
              }}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreVertical className="w-4 h-4 text-gray-600" />
            </button>

            {showMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowMenu(false);
                  }}
                />
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      onEdit(project);
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-t-lg"
                  >
                    <Edit className="w-4 h-4" />
                    Edit Project
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      if (confirm('Are you sure you want to delete this project?')) {
                        onDelete(project.id);
                      }
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-b-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete Project
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="mt-4 text-xs text-gray-500">
          Updated {format(new Date(project.updated_at), 'MMM d, yyyy')}
        </div>
      </div>
    </Link>
  );
}
