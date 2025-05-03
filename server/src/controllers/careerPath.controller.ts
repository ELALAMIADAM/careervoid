import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { CareerPathNode, CareerPathConnection } from '../models/careerPath.model';
import { Resume } from '../models/resume.model';
import sequelize from '../config/database';
import { Op } from 'sequelize';
import openaiService from '../services/openai.service';

/**
 * Generate career path
 */
export const generateCareerPath = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { currentRole, experience, goals, resumeId } = req.body;

    if (!currentRole || !experience || !goals) {
      return res.status(400).json({ message: 'Current role, experience level, and goals are required' });
    }

    // Extract skills from resume if resumeId is provided
    let skills: string[] = req.body.skills || [];

    if (resumeId) {
      const resume = await Resume.findOne({
        where: {
          id: resumeId,
          userId: req.userId
        }
      });

      if (resume) {
        skills = resume.skills;
      }
    }

    // Generate career path with OpenAI
    const careerPathData = await openaiService.generateCareerPathSuggestions(
      currentRole,
      experience,
      skills,
      goals
    );

    // Create current position node
    const currentPositionNode = await CareerPathNode.create({
      userId: req.userId,
      title: currentRole,
      level: experience,
      description: careerPathData.currentPosition?.description || `Current role: ${currentRole}`,
      skills: careerPathData.currentPosition?.skills || skills,
      salaryRange: careerPathData.currentPosition?.salaryRange,
      isCurrentPosition: true
    });

    // Create future position nodes and connections
    const createdNodes = [currentPositionNode];

    for (const pathNode of careerPathData.careerPath || []) {
      const node = await CareerPathNode.create({
        userId: req.userId,
        title: pathNode.title,
        level: pathNode.level,
        description: pathNode.description,
        skills: pathNode.skills || [],
        salaryRange: pathNode.salaryRange,
        timeToAchieve: pathNode.timeToAchieve,
        prerequisites: pathNode.prerequisites,
        nextSteps: pathNode.nextSteps,
        resources: pathNode.resources,
        isCurrentPosition: false
      });

      createdNodes.push(node);

      // Create connection from current node to this node
      await CareerPathConnection.create({
        sourceNodeId: currentPositionNode.id,
        targetNodeId: node.id,
        type: 'NEXT_ROLE',
        probability: pathNode.probability,
        description: pathNode.connectionDescription || `Path from ${currentRole} to ${pathNode.title}`
      });

      // Create connections between different future nodes if specified
      if (pathNode.connections) {
        for (const connection of pathNode.connections) {
          // Find the target node in our created nodes array
          const targetNode = createdNodes.find(n => n.title === connection.targetRole);
          
          if (targetNode) {
            await CareerPathConnection.create({
              sourceNodeId: node.id,
              targetNodeId: targetNode.id,
              type: connection.type || 'NEXT_ROLE',
              probability: connection.probability,
              description: connection.description
            });
          }
        }
      }
    }

    res.status(201).json({
      message: 'Career path generated successfully',
      currentNode: currentPositionNode,
      totalNodes: createdNodes.length
    });
  } catch (error) {
    console.error('Error generating career path:', error);
    res.status(500).json({ message: 'Server error during career path generation' });
  }
};

/**
 * Get user's career path
 */
export const getUserCareerPath = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Get all nodes for user
    const nodes = await CareerPathNode.findAll({
      where: { userId: req.userId }
    });

    if (nodes.length === 0) {
      return res.status(404).json({ message: 'No career path found for user' });
    }

    // Get all connections
    const nodeIds = nodes.map(node => node.id);
    
    const connections = await CareerPathConnection.findAll({
      where: {
        [Op.or]: [
          { sourceNodeId: nodeIds },
          { targetNodeId: nodeIds }
        ]
      }
    });

    res.status(200).json({
      message: 'Career path retrieved successfully',
      nodes,
      connections
    });
  } catch (error) {
    console.error('Error retrieving career path:', error);
    res.status(500).json({ message: 'Server error while retrieving career path' });
  }
};

/**
 * Delete career path
 */
export const deleteCareerPath = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Delete all nodes (connections will be deleted by CASCADE)
    const result = await CareerPathNode.destroy({
      where: { userId: req.userId }
    });

    if (result === 0) {
      return res.status(404).json({ message: 'No career path found for user' });
    }

    res.status(200).json({ message: 'Career path deleted successfully' });
  } catch (error) {
    console.error('Error deleting career path:', error);
    res.status(500).json({ message: 'Server error during career path deletion' });
  }
};

/**
 * Add a new node to the career path
 */
export const addCareerPathNode = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { 
      title, 
      level, 
      description, 
      skills, 
      salaryRange,
      timeToAchieve,
      prerequisites,
      nextSteps,
      resources,
      isCurrentPosition,
      connectionToNodeId,
      connectionType,
      connectionDescription
    } = req.body;

    // Validate input
    if (!title || !level || !description) {
      return res.status(400).json({ message: 'Title, level, and description are required' });
    }

    // Check if user already has a current position if this is set as current
    if (isCurrentPosition) {
      const existingCurrentNode = await CareerPathNode.findOne({
        where: {
          userId: req.userId,
          isCurrentPosition: true
        }
      });

      if (existingCurrentNode) {
        return res.status(400).json({ message: 'User already has a current position node' });
      }
    }

    // Create new node
    const node = await CareerPathNode.create({
      userId: req.userId,
      title,
      level,
      description,
      skills: skills || [],
      salaryRange,
      timeToAchieve,
      prerequisites,
      nextSteps,
      resources,
      isCurrentPosition: isCurrentPosition || false
    });

    // Create connection if specified
    if (connectionToNodeId) {
      const targetNode = await CareerPathNode.findOne({
        where: {
          id: connectionToNodeId,
          userId: req.userId
        }
      });

      if (!targetNode) {
        return res.status(404).json({ message: 'Target node not found' });
      }

      await CareerPathConnection.create({
        sourceNodeId: node.id,
        targetNodeId: connectionToNodeId,
        type: connectionType || 'NEXT_ROLE',
        description: connectionDescription
      });
    }

    res.status(201).json({
      message: 'Career path node added successfully',
      node
    });
  } catch (error) {
    console.error('Error adding career path node:', error);
    res.status(500).json({ message: 'Server error during node addition' });
  }
};

/**
 * Create a connection between nodes
 */
export const addCareerPathConnection = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.userId) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { sourceNodeId, targetNodeId, type, probability, description } = req.body;

    if (!sourceNodeId || !targetNodeId) {
      return res.status(400).json({ message: 'Source and target node IDs are required' });
    }

    // Verify that both nodes belong to the user
    const sourceNode = await CareerPathNode.findOne({
      where: {
        id: sourceNodeId,
        userId: req.userId
      }
    });

    const targetNode = await CareerPathNode.findOne({
      where: {
        id: targetNodeId,
        userId: req.userId
      }
    });

    if (!sourceNode || !targetNode) {
      return res.status(404).json({ message: 'One or both nodes not found' });
    }

    // Create connection
    const connection = await CareerPathConnection.create({
      sourceNodeId,
      targetNodeId,
      type: type || 'NEXT_ROLE',
      probability,
      description
    });

    res.status(201).json({
      message: 'Connection created successfully',
      connection
    });
  } catch (error) {
    console.error('Error creating connection:', error);
    res.status(500).json({ message: 'Server error during connection creation' });
  }
}; 