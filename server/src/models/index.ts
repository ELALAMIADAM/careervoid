import { Sequelize } from 'sequelize';
import sequelize from '../config/database';
import { User } from './user.model';
import { Resume } from './resume.model';
import type { ResumeExperience, ResumeEducation } from './resume.model';
import { Job } from './job.model';
import { CoverLetter } from './coverLetter.model';
import { Application, ApplicationStatus } from './application.model';
import { InterviewPrep, InterviewType } from './interview.model';
import type { InterviewQuestion } from './interview.model';
import { CareerPathNode, CareerPathConnection } from './careerPath.model';

// Initialize all models and their relationships
export const initDatabase = async () => {
  try {
    // Set up relationships

    // User relationships
    User.hasMany(Resume, { foreignKey: 'userId', onDelete: 'CASCADE' });
    Resume.belongsTo(User, { foreignKey: 'userId' });

    User.hasMany(CoverLetter, { foreignKey: 'userId', onDelete: 'CASCADE' });
    CoverLetter.belongsTo(User, { foreignKey: 'userId' });

    User.hasMany(Application, { foreignKey: 'userId', onDelete: 'CASCADE' });
    Application.belongsTo(User, { foreignKey: 'userId' });

    User.hasMany(InterviewPrep, { foreignKey: 'userId', onDelete: 'CASCADE' });
    InterviewPrep.belongsTo(User, { foreignKey: 'userId' });

    User.hasMany(CareerPathNode, { foreignKey: 'userId', onDelete: 'CASCADE' });
    CareerPathNode.belongsTo(User, { foreignKey: 'userId' });

    // Resume relationships
    Resume.hasMany(CoverLetter, { foreignKey: 'resumeId' });
    CoverLetter.belongsTo(Resume, { foreignKey: 'resumeId' });

    Resume.hasMany(Application, { foreignKey: 'resumeId' });
    Application.belongsTo(Resume, { foreignKey: 'resumeId' });

    // Job relationships
    Job.hasMany(Application, { foreignKey: 'jobId' });
    Application.belongsTo(Job, { foreignKey: 'jobId' });

    Job.hasMany(CoverLetter, { foreignKey: 'jobId' });
    CoverLetter.belongsTo(Job, { foreignKey: 'jobId' });

    // Application relationships
    Application.hasMany(InterviewPrep, { foreignKey: 'applicationId' });
    InterviewPrep.belongsTo(Application, { foreignKey: 'applicationId' });

    // Career path relationships - fix for duplicate alias issue
    // Source connections (from this node to others)
    CareerPathNode.hasMany(CareerPathConnection, { 
      foreignKey: 'sourceNodeId', 
      as: 'outgoingConnections',
      onDelete: 'CASCADE' 
    });
    CareerPathConnection.belongsTo(CareerPathNode, { 
      foreignKey: 'sourceNodeId', 
      as: 'sourceNode' 
    });

    // Target connections (from others to this node)
    CareerPathNode.hasMany(CareerPathConnection, { 
      foreignKey: 'targetNodeId', 
      as: 'incomingConnections',
      onDelete: 'CASCADE' 
    });
    CareerPathConnection.belongsTo(CareerPathNode, { 
      foreignKey: 'targetNodeId', 
      as: 'targetNode' 
    });

    // Sync all models
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully');

    return {
      sequelize,
      User,
      Resume,
      Job,
      CoverLetter,
      Application,
      InterviewPrep,
      CareerPathNode,
      CareerPathConnection
    };
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

// Export models and Sequelize instance
export {
  sequelize,
  Sequelize,
  User,
  Resume,
  Job,
  CoverLetter,
  Application,
  ApplicationStatus,
  InterviewPrep,
  InterviewType,
  CareerPathNode,
  CareerPathConnection
};

// Export types
export type {
  ResumeExperience,
  ResumeEducation,
  InterviewQuestion
}; 